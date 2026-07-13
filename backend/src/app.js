const express = require('express');
const cors = require('cors');
const sistemaRoutes = require('./routes/sistema.routes');
const authRoutes = require('./routes/auth.routes');
const vtasRoutes = require('./routes/vtas.routes');
const clientesRoutes = require('./routes/clientes.routes');
const reporteRoutes = require('./routes/reporte.routes');

const app= express();

app.use(cors());
app.use(express.json());

app.use("/", sistemaRoutes);
app.use("/auth", authRoutes);
app.use("/vtas", vtasRoutes);
app.use("/clientes", clientesRoutes);
app.use("/reporte", reporteRoutes);

module.exports = app;