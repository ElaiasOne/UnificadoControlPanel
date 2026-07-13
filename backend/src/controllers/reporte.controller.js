const { 
    obtenerUltimaSemanaSabadoAViernes, 
    generarPDFReporte, 
    enviarCorreoReporte 
} = require('../services/reporte.service');
const { obtenerVtas } = require('../services/vtas.service');

async function enviarReportePruebaController(req, res) {
    try {
        const { desde, hasta } = obtenerUltimaSemanaSabadoAViernes();
        
        // Obtener ventas para el rango
        const vtas = await obtenerVtas({ desde, hasta });
        
        // Filtrar clientes con menos de 4 dias
        const clientesFiltrados = vtas.filter(item => item.Dias < 4);
        clientesFiltrados.sort((a, b) => a.Dias - b.Dias);
        
        // Generar PDF en memoria
        const pdfBuffer = await generarPDFReporte(clientesFiltrados, desde, hasta);
        
        // Destinatario por defecto o query parameter
        const destinatario = req.query.email || 'eliasjosefigueroa2018@gmail.com';
        
        // Enviar correo
        const info = await enviarCorreoReporte(pdfBuffer, desde, hasta, destinatario);
        
        res.json({
            ok: true,
            message: 'Reporte de prueba enviado exitosamente',
            destinatario,
            info: {
                messageId: info.messageId,
                accepted: info.accepted
            },
            periodo: {
                desde: desde.toLocaleDateString('es-AR'),
                hasta: hasta.toLocaleDateString('es-AR')
            },
            clientesEnviados: clientesFiltrados.length
        });
    } catch (error) {
        console.error('Error al enviar reporte de prueba:', error);
        res.status(500).json({
            ok: false,
            message: 'Error al enviar reporte de prueba',
            error: error.message
        });
    }
}

module.exports = {
    enviarReportePruebaController
};
