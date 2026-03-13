const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'EJFNACHJF';
const JWT_EXPIRATION = '8h';

// Fuente actual de usuarios autenticables

const USUARIOS = [
    { id: 1,
      username: 'Elias',
      password: '3005',
      nombre: 'Administrador',
      rol: 'admin',
    }
];

function limpiarUsuario(usuario) {
    const { password, ...usuarioSinPassword } = usuario;
    return usuarioSinPassword;
}

function autenticarUsuario(username, password) {
    const usuario = USUARIOS.find(
        (item) => item.username === username && item.password === password
    );
    
    if (!usuario) {
        return null;
    }

    return limpiarUsuario(usuario);
}

function generarToken(usuario) {
    return jwt.sign(
        { 
            sub: usuario.id,
            username: usuario.username,
            rol: usuario.rol,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRATION }
    );
}
    
function verificarToken(token) {
    return jwt.verify(token, JWT_SECRET);
}

module.exports = {
    autenticarUsuario,
    generarToken,
    verificarToken,
};