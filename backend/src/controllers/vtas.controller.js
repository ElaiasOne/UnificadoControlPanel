const { obtenerVtas } = require('../services/vtas.service');

async function obtenerVtasController(req, res) {
    try {
        const { desde, hasta } = req.query;
        const vtas = await obtenerVtas({ desde, hasta });
        res.json(vtas);
    } catch (error) {
        console.error('Error al obtener ventas:', error);
        res.status(500).json({ message: 'Error al obtener ventas' });
    }
}

module.exports = {
    obtenerVtasController,
};