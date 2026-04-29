const sql = require('mssql');

function parseBoolean(value, fallback) {
    if (value === undefined) {
        return fallback;
    }

    return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function parsePort(value, fallback) {
    const parsed = Number.parseInt(String(value ?? ''), 10);
    return Number.isNaN(parsed) ? fallback : parsed;
}

// Configuracion de conexion a la base de datos SQL Server
const configDB = {
    user: process.env.DB_USER || 'shsUnificado',
    password: process.env.DB_PASSWORD || '',
    server: process.env.DB_SERVER || '72.62.137.165',
    database: process.env.DB_NAME || 'TecnolarUnificado',
    port: parsePort(process.env.DB_PORT, 1433),
    options: {
        encrypt: parseBoolean(process.env.DB_ENCRYPT, false),
        trustServerCertificate: parseBoolean(process.env.DB_TRUST_SERVER_CERTIFICATE, false),
    },
};

// Crear una instancia de pool de conexiones
let poolPromise;

// Función para obtener el pool de conexiones
function getPool() {
    if (!poolPromise) {
        poolPromise = sql.connect(configDB)
    }

    return poolPromise;
}

// Funcion para validadr la conexion a la base de datos
async function validarConexion() {
    try {
        await getPool();
        console.log('Conexión a la base de datos exitosa');
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
        throw error;
    }
}

module.exports = {
    getPool,
    sql,
    validarConexion,
};