const app = require('./src/app');
const { validarConexion } = require('./src/db/connection');

const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
    try {
        await validarConexion();
    } catch (error) {
        console.warn('Advertencia: no se pudo validar la conexion SQL', error);
        console.warn(error.message);
    }

    app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto http://localhost:${PORT}`);
});}

iniciarServidor();

