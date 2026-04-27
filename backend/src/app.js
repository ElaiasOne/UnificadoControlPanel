const express = require('express');
const cors = require('cors');
const sistemaRoutes = require('./routes/sistema.routes');
const authRoutes = require('./routes/auth.routes');
const vtasRoutes = require('./routes/vtas.routes');
const clientesRoutes = require('./routes/clientes.routes');

const app= express();

app.use(cors());
app.use(express.json());

app.use("/", sistemaRoutes);
app.use("/auth", authRoutes);
app.use("/vtas", vtasRoutes);
app.use("/clientes", clientesRoutes);

module.exports = app;