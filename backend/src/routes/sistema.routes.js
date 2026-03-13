const express = require('express');

const router = express.Router();

// Ruta inicial

router.get('/', (req, res) => {
    res.send('API funcionando correctamente');
});

router.get("/estado", (_req, res) => {
  res.json({
    ok: true,
    servicio: "backend",
    timestamp: new Date().toISOString()
  });
});

module.exports = router;