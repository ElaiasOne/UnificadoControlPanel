const {
    listarClientes,
    crearCliente,
    actualizarCliente,
    bajaCliente,
} = require('../services/clientes.service');

async function listarClientesController(_req, res) {
    try {
        const clientes = await listarClientes();
        res.json(clientes);
    } catch (error) {
        console.error('Error al listar clientes:', error);
        res.status(500).json({ message: 'Error al listar clientes' });
    }
}

async function crearClienteController(req, res) {
    try {
        const cliente = await crearCliente(req.body);
        res.status(201).json(cliente);
    } catch (error) {
        console.error('Error al crear cliente:', error);
        res.status(400).json({ message: error.message || 'Error al crear cliente' });
    }
}

async function actualizarClienteController(req, res) {
    try {
        const { clienteWeb, sucursal } = req.params;
        const cliente = await actualizarCliente(clienteWeb, sucursal, req.body);
        res.json(cliente);
    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        res.status(400).json({ message: error.message || 'Error al actualizar cliente' });
    }
}

async function bajaClienteController(req, res) {
    try {
        const { clienteWeb, sucursal } = req.params;
        const cliente = await bajaCliente(clienteWeb, sucursal);
        res.json(cliente);
    } catch (error) {
        console.error('Error al dar de baja cliente:', error);
        res.status(400).json({ message: error.message || 'Error al dar de baja cliente' });
    }
}

module.exports = {
    listarClientesController,
    crearClienteController,
    actualizarClienteController,
    bajaClienteController,
};
