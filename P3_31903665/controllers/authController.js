const db = require('../models');
const signToken = require('../utils/jwt');
const { success, fail, error } = require('../utils/jsend');

// POST /auth/register
exports.register = async (req, res) => {
    // Usamos nombreCompleto para ser consistentes con el modelo
    const { nombreCompleto, email, password } = req.body;
    try {
        // La validación de email único y el hasheo de contraseña ocurren en el modelo
        const user = await db.User.create({ nombreCompleto, email, password });

        // Emitir JWT
        const token = signToken(user.id);
        
        // El método toJSON() del modelo ya se encarga de no enviar la contraseña
        res.status(201).json(success({ user, token }));

    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json(fail({ email: 'El email ya está registrado' }));
        }
        res.status(500).json(error(err.message));
    }
};

// POST /auth/login
exports.login = async (req, res) => {
    const { email, password } = req.body;

    // 1. Verificar si existen email y password
    if (!email || !password) {
        return res.status(400).json(fail({ credentials: 'Por favor, proporcione email y contraseña' }));
    }

    try {
        // 2. Buscar usuario y verificar contraseña
        const user = await db.User.findOne({ where: { email } });

        if (!user || !(await user.comparePassword(password))) {
            // Usamos 401 Unauthorized para fallos de credenciales
            return res.status(401).json(fail({ credentials: 'Credenciales inválidas' }));
        }

        // 3. Emitir token si las credenciales son correctas
        const token = signToken(user.id);

        // El método toJSON() del modelo ya se encarga de no enviar la contraseña
        res.status(200).json(success({ user, token }));

    } catch (err) {
        res.status(500).json(error(err.message));
    }
};