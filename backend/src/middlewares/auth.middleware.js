const { verificarToken } = require ("../services/auth.service");

function requireAuth(req, res, next) {
    const authorization = req.headers.authorization || "";
    const [tipo, token] = authorization.split(" ");
    if (tipo !== "Bearer" || !token) {
        res.status(401).json({ message: "Token no proporcionado o formato inválido" });
        return;
    }

    try {
        const payload = verificarToken(token);
        req.usuario = {
            id: payload.sub,
            username: payload.username,
            rol: payload.rol,
        };
        next();
    } catch (error) {
        res.status(401).json({ message: "Token inválido o expirado" });
    }
        }

module.exports = {
    requireAuth,
};