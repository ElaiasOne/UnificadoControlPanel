const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const cron = require('node-cron');

// Calcula la semana de lunes a domingo.
function obtenerSemanaLunesADomingo(referencia = new Date()) {
    const hoy = new Date(referencia);
    const diaSemana = hoy.getDay(); // 0: Domingo, 1: Lunes, ..., 6: Sabado
    const diasDesdeLunes = diaSemana === 0 ? 6 : diaSemana - 1;

    const desde = new Date(hoy);
    desde.setDate(hoy.getDate() - diasDesdeLunes);
    desde.setHours(0, 0, 0, 0);

    const hasta = new Date(desde);
    hasta.setDate(desde.getDate() + 6);
    hasta.setHours(23, 59, 59, 999);

    return { desde, hasta };
}

// Genera un documento PDF en memoria con el listado de clientes.
function generarPDFReporte(clientes, fechaDesde, fechaHasta) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ layout: 'landscape', size: 'A4', margin: 40 });
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData);
        });
        doc.on('error', (err) => reject(err));

        // Titulo del reporte
        doc.fontSize(16).text('Reporte de ventas por cliente (Menos de 4 dias)', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(10).text(`Periodo: ${fechaDesde.toLocaleDateString('es-AR')} al ${fechaHasta.toLocaleDateString('es-AR')}`, { align: 'center' });
        doc.text(`Generado: ${new Date().toLocaleString('es-AR')}`, { align: 'center' });
        doc.moveDown(1.5);

        // Tabla configuracion
        const headers = ['Cliente', 'Descripcion', 'Sucursal', 'Direccion', 'Localidad', 'Provincia', 'Dias'];
        const colWidths = [60, 150, 50, 150, 100, 100, 40];
        
        let y = doc.y;

        // Dibujar cabeceras
        doc.fontSize(9).font('Helvetica-Bold');
        let currentX = 40;
        headers.forEach((header, index) => {
            doc.text(header, currentX, y, { width: colWidths[index], align: index === 6 ? 'right' : 'left' });
            currentX += colWidths[index];
        });
        
        doc.moveDown(0.5);
        y = doc.y;
        doc.moveTo(40, y).lineTo(790, y).strokeColor('#106f58').lineWidth(1).stroke();
        doc.moveDown(0.5);
        
        // Dibujar filas
        doc.font('Helvetica').fontSize(8);
        clientes.forEach((item) => {
            y = doc.y;
            // Si nos pasamos de la pagina, agregar una nueva
            if (y > 500) {
                doc.addPage({ layout: 'landscape', size: 'A4', margin: 40 });
                y = doc.y;
                
                // Repetir cabecera
                doc.font('Helvetica-Bold').fontSize(9);
                let cx = 40;
                headers.forEach((header, index) => {
                    doc.text(header, cx, y, { width: colWidths[index], align: index === 6 ? 'right' : 'left' });
                    cx += colWidths[index];
                });
                doc.moveDown(0.5);
                y = doc.y;
                doc.moveTo(40, y).lineTo(790, y).strokeColor('#106f58').lineWidth(1).stroke();
                doc.moveDown(0.5);
                y = doc.y;
                doc.font('Helvetica').fontSize(8);
            }
            
            let cx = 40;
            const rowData = [
                String(item.ClienteWeb ?? ''),
                String(item.Descripcion ?? ''),
                String(item.Sucursal ?? ''),
                String(item.Direccion ?? '-'),
                String(item.Localidad ?? '-'),
                String(item.Provincia ?? '-'),
                String(item.Dias ?? 0)
            ];
            
            rowData.forEach((val, idx) => {
                doc.text(val, cx, y, { width: colWidths[idx], align: idx === 6 ? 'right' : 'left' });
                cx += colWidths[idx];
            });
            doc.moveDown(0.4);
        });

        doc.end();
    });
}

// Envia el correo electronico con el PDF adjunto.
async function enviarCorreoReporte(pdfBuffer, fechaDesde, fechaHasta, destinatario) {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || '465', 10);
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM || `"Tecnolar Unificado" <${user}>`;

    if (!user || !pass) {
        throw new Error('Configuracion SMTP incompleta en el archivo .env (SMTP_USER y SMTP_PASS son requeridos)');
    }

    const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
            user,
            pass,
        },
    });

    const fDesdeStr = fechaDesde.toLocaleDateString('es-AR');
    const fHastaStr = fechaHasta.toLocaleDateString('es-AR');

    const mailOptions = {
        from,
        to: destinatario,
        subject: `Reporte Semanal de Ventas (Clientes < 4 dias) - ${fDesdeStr} al ${fHastaStr}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #106f58; margin-top: 0;">Reporte Semanal de Clientes con Pocas Ventas</h2>
                <p>Estimado administrador,</p>
                <p>Se adjunta el reporte en formato PDF correspondiente al periodo del <strong>${fDesdeStr}</strong> al <strong>${fHastaStr}</strong>.</p>
                <p>Este reporte contiene la lista de clientes habilitados que registraron ventas en <strong>menos de 4 dias</strong> durante la ultima semana.</p>
                <br>
                <hr style="border: 0; border-top: 1px solid #e0e0e0;" />
                <p style="font-size: 11px; color: #777;">Este es un correo automatico generado por el Panel de Control Unificado de Tecnolar.</p>
            </div>
        `,
        attachments: [
            {
                filename: `reporte-clientes-menos-4-dias-${new Date().toISOString().slice(0, 10)}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf'
            }
        ]
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
}

// Inicializa el cron para correr todos los lunes a las 09:00 hs.
function iniciarCronReporte() {
    // Minuto 0, Hora 9, Lunes (1)
    cron.schedule('0 9 * * 1', async () => {
        console.log('Cron: Iniciando envio automatico del reporte semanal...');
        try {
            // Se toma la semana recien concluida de lunes a domingo.
            const ayer = new Date();
            ayer.setDate(ayer.getDate() - 1);
            const { desde, hasta } = obtenerSemanaLunesADomingo(ayer);
            const { obtenerVtas } = require('./vtas.service');
            const vtas = await obtenerVtas({ desde, hasta });
            
            const clientesFiltrados = vtas.filter(item => item.Dias < 4);
            clientesFiltrados.sort((a, b) => a.Dias - b.Dias);
            
            const pdfBuffer = await generarPDFReporte(clientesFiltrados, desde, hasta);
            const destinatario = 'eliasjosefigueroa2018@gmail.com';
            
            await enviarCorreoReporte(pdfBuffer, desde, hasta, destinatario);
            console.log('Cron: Reporte semanal enviado con exito.');
        } catch (error) {
            console.error('Cron: Error al enviar el reporte semanal programado:', error);
        }
    });
    console.log('Cron: Tarea programada del reporte semanal registrada (Lunes a las 09:00 hs)');
}

module.exports = {
    obtenerSemanaLunesADomingo,
    obtenerUltimaSemanaSabadoAViernes: obtenerSemanaLunesADomingo,
    generarPDFReporte,
    enviarCorreoReporte,
    iniciarCronReporte,
};
