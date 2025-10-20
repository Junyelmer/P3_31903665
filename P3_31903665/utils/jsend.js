/**
 * Genera una respuesta JSend de éxito.
 * @param {object} data - El payload de la respuesta.
 * @returns {{status: string, data: object}}
 */
exports.success = (data) => ({
    status: 'success',
    data: data
});

/**
 * Genera una respuesta JSend de fallo (error de cliente).
 * @param {object} data - Objeto con los detalles del fallo.
 * @returns {{status: string, data: object}}
 */
exports.fail = (data) => ({
    status: 'fail',
    data: data
});

/**
 * Genera una respuesta JSend de error (error de servidor).
 * @param {string} message - El mensaje de error.
 * @returns {{status: string, message: string}}
 */
exports.error = (message) => ({
    status: 'error',
    message: message
});