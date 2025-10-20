const jwt = require('jsonwebtoken');
const db = require('../models');
const { error } = require('../utils/jsend');

exports.protect = async (req, res, next) => {
    let token;

    // 1. Obtener el token (normalmente del header 'Authorization')
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        // 401 Unauthorized - Token no presente
        return res.status(401).json(error('Acceso denegado: No se proporcionó token'));
    }

    try {
        // 2. Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Buscar el usuario
        const currentUser = await db.User.findByPk(decoded.id);

        if (!currentUser) {
            // 401 Unauthorized - Token válido, pero el usuario ya no existe
            return res.status(401).json(error('El usuario asociado al token ya no existe'));
        }

        // 4. Adjuntar el usuario a la solicitud (para usarlo en rutas posteriores)
        req.user = currentUser;
        next();

    } catch (err) {
        // 401 Unauthorized - Token inválido (expirado, malformado, etc.)
        return res.status(401).json(error('Token inválido o expirado'));
    }
};