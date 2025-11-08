const jwt = require('jsonwebtoken');

        // Token secreto, debe ser cargado desde variables de entorno
        const JWT_SECRET = process.env.JWT_SECRET || 'mi_clave_secreta_superura';

const protect = (req, res, next) => {
    let token;

    // Soportar distintas formas de enviar el encabezado (mayúsculas/minúsculas)
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (authHeader) {
        try {
            // Posibles formatos: 'Bearer <token>' o solo '<token>'
            const parts = authHeader.split(' ');
            token = parts.length === 2 ? parts[1] : parts[0];

            // Verificar el token (lanza si es inválido/expiró)
            const decoded = jwt.verify(token, JWT_SECRET);

            // Adjuntar el ID del usuario al request
            req.userId = decoded.id;

            return next();
        } catch (error) {
            // Añadir información mínima de depuración en entornos de test
            if (process.env.NODE_ENV === 'test') {
                // eslint-disable-next-line no-console
                console.log('AUTH MIDDLEWARE: token parse/verify error:', error.message);
            }
            return res.status(401).json({ status: 'error', message: 'Token inválido o expirado' });
        }
    }

    // Rechazar peticiones sin token
    return res.status(401).json({ status: 'error', message: 'Acceso denegado: No se proporcionó token' });
};

module.exports = { protect };