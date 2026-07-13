const express = require('express');
const { enviarReportePruebaController } = require('../controllers/reporte.controller');

const router = express.Router();

// Ruta publica para forzar el envio del reporte por email para pruebas
router.get('/enviar-prueba', enviarReportePruebaController);

module.exports = router;
