const jwt = require('jsonwebtoken');

/**
 * Firma un nuevo token JWT con el ID del usuario.
 * @param {string} id - El ID del usuario a incluir en el payload del token.
 * @returns {string} El token JWT firmado.
 */
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1d' // El token expira en 1 día
    });
};

module.exports = signToken;