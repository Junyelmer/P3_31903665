const jwt = require('jsonwebtoken');

// Token secreto, debe ser cargado desde variables de entorno
const JWT_SECRET = process.env.JWT_SECRET || 'mi_clave_secreta_superura';

const protect = (req, res, next) => {
    let token;

    // 1. Obtener el token del encabezado (Bearer <token>)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // El token es la segunda parte del string 'Bearer <token>'
            token = req.headers.authorization.split(' ')[1];
            
            // 2. Verificar el token
            const decoded = jwt.verify(token, JWT_SECRET);
            
            // Adjuntar el ID del usuario al request (útil para GET /users/:id, etc.)
            req.userId = decoded.id;
            
            return next();

        } catch (error) {
            // Error si el token es inválido o expiró
            return res.status(401).json({ status: 'error', message: 'Token inválido o expirado' });
        }
    }

    // 3. Requisito: Rechazar peticiones sin token
    if (!token) {
        return res.status(401).json({ status: 'error', message: 'Acceso denegado: No se proporcionó token' });
    }
};

module.exports = { protect };