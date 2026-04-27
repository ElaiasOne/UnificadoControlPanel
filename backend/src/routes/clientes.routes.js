const express = require('express');
const { requireAuth } = require('../middlewares/auth.middleware');
const {
    listarClientesController,
    crearClienteController,
    actualizarClienteController,
    bajaClienteController,
} = require('../controllers/clientes.controller');

const router = express.Router();

router.get('/', requireAuth, listarClientesController);
router.post('/', requireAuth, crearClienteController);
router.put('/:clienteWeb/:sucursal', requireAuth, actualizarClienteController);
router.patch('/:clienteWeb/:sucursal/baja', requireAuth, bajaClienteController);

module.exports = router;
