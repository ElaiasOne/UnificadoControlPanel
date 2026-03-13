const express = require('express');
const { obtenerVtasController } = require('../controllers/vtas.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/vtas', requireAuth, obtenerVtasController);

module.exports = router;