const {
    autenticarUsuario,
    generarToken,
} = require('../services/auth.service');

async function loginController(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({ message: 'Debes proporcionar un nombre de usuario y una contraseña' });
        return;
    }

    const usuario = await autenticarUsuario(username, password);

    if (!usuario) {
        res.status(401).json({ message: 'Credenciales inválidas' });
        return;
    }

    const token = generarToken(usuario);
    res.json({ token, usuario, });
}

async function perfilController(req, res) {
    res.json({ usuario: req.usuario });
}

module.exports = {
    loginController,
    perfilController,
}; 