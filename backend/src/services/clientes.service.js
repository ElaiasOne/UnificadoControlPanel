const { getPool, sql } = require('../db/connection');

function validarEntero(value, fieldName) {
    const numero = Number.parseInt(String(value), 10);
    if (Number.isNaN(numero)) {
        throw new Error(`El campo ${fieldName} debe ser un numero entero`);
    }

    return numero;
}

function validarTexto(value, fieldName) {
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error(`El campo ${fieldName} es obligatorio`);
    }

    return value.trim();
}

function validarBit(value) {
    if (typeof value === 'boolean') {
        return value;
    }

    if (value === 0 || value === 1 || value === '0' || value === '1') {
        return Number(value) === 1;
    }

    throw new Error('El campo Habilitado debe ser booleano (true/false)');
}

function normalizarClientePayload(payload = {}) {
    return {
        ClienteWeb: validarEntero(payload.ClienteWeb, 'ClienteWeb'),
        Sucursal: validarEntero(payload.Sucursal, 'Sucursal'),
        Descripcion: validarTexto(payload.Descripcion, 'Descripcion'),
        Direccion: validarTexto(payload.Direccion, 'Direccion'),
        Localidad: validarEntero(payload.Localidad, 'Localidad'),
        Rubro: validarTexto(payload.Rubro, 'Rubro'),
        Habilitado: validarBit(payload.Habilitado),
    };
}

async function listarClientes() {
    const pool = await getPool();
    const result = await pool.request().query(`
        SELECT
            ClienteWeb,
            Sucursal,
            Descripcion,
            Direccion,
            Localidad,
            Rubro,
            Habilitado
        FROM Clientes
        ORDER BY ClienteWeb ASC, Sucursal ASC
    `);

    return result.recordset;
}

async function crearCliente(payload) {
    const cliente = normalizarClientePayload(payload);
    const pool = await getPool();
    const request = pool.request();

    request.input('ClienteWeb', sql.Int, cliente.ClienteWeb);
    request.input('Sucursal', sql.Int, cliente.Sucursal);

    const existeResult = await request.query(`
        SELECT 1 AS Existe
        FROM Clientes
        WHERE ClienteWeb = @ClienteWeb AND Sucursal = @Sucursal
    `);

    if (existeResult.recordset.length > 0) {
        throw new Error('Ya existe un cliente con la clave ClienteWeb/Sucursal indicada');
    }

    const insertRequest = pool.request();
    insertRequest.input('ClienteWeb', sql.Int, cliente.ClienteWeb);
    insertRequest.input('Sucursal', sql.Int, cliente.Sucursal);
    insertRequest.input('Descripcion', sql.NVarChar(255), cliente.Descripcion);
    insertRequest.input('Direccion', sql.NVarChar(255), cliente.Direccion);
    insertRequest.input('Localidad', sql.Int, cliente.Localidad);
    insertRequest.input('Rubro', sql.NVarChar(255), cliente.Rubro);
    insertRequest.input('Habilitado', sql.Bit, cliente.Habilitado);

    await insertRequest.query(`
        INSERT INTO Clientes (
            ClienteWeb,
            Sucursal,
            Descripcion,
            Direccion,
            Localidad,
            Rubro,
            Habilitado
        )
        VALUES (
            @ClienteWeb,
            @Sucursal,
            @Descripcion,
            @Direccion,
            @Localidad,
            @Rubro,
            @Habilitado
        )
    `);

    return cliente;
}

async function actualizarCliente(clienteWebParam, sucursalParam, payload) {
    const cliente = normalizarClientePayload({
        ...payload,
        ClienteWeb: clienteWebParam,
        Sucursal: sucursalParam,
    });

    const pool = await getPool();
    const request = pool.request();

    request.input('ClienteWeb', sql.Int, cliente.ClienteWeb);
    request.input('Sucursal', sql.Int, cliente.Sucursal);
    request.input('Descripcion', sql.NVarChar(255), cliente.Descripcion);
    request.input('Direccion', sql.NVarChar(255), cliente.Direccion);
    request.input('Localidad', sql.Int, cliente.Localidad);
    request.input('Rubro', sql.NVarChar(255), cliente.Rubro);
    request.input('Habilitado', sql.Bit, cliente.Habilitado);

    const result = await request.query(`
        UPDATE Clientes
        SET
            Descripcion = @Descripcion,
            Direccion = @Direccion,
            Localidad = @Localidad,
            Rubro = @Rubro,
            Habilitado = @Habilitado
        WHERE ClienteWeb = @ClienteWeb AND Sucursal = @Sucursal
    `);

    if (result.rowsAffected[0] === 0) {
        throw new Error('No existe el cliente indicado para modificar');
    }

    return cliente;
}

async function bajaCliente(clienteWebParam, sucursalParam) {
    const clienteWeb = validarEntero(clienteWebParam, 'ClienteWeb');
    const sucursal = validarEntero(sucursalParam, 'Sucursal');

    const pool = await getPool();
    const request = pool.request();

    request.input('ClienteWeb', sql.Int, clienteWeb);
    request.input('Sucursal', sql.Int, sucursal);

    const result = await request.query(`
        UPDATE Clientes
        SET Habilitado = 0
        WHERE ClienteWeb = @ClienteWeb AND Sucursal = @Sucursal
    `);

    if (result.rowsAffected[0] === 0) {
        throw new Error('No existe el cliente indicado para dar de baja');
    }

    return { ClienteWeb: clienteWeb, Sucursal: sucursal, Habilitado: false };
}

module.exports = {
    listarClientes,
    crearCliente,
    actualizarCliente,
    bajaCliente,
};
