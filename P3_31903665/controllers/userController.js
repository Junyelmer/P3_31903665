const db = require('../models');
const { success, fail, error } = require('../utils/jsend');

// GET /users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await db.User.findAll();
        res.status(200).json(success(users));
    } catch (err) {
        res.status(500).json(error(err.message));
    }
};

// GET /users/:id
exports.getUserById = async (req, res) => {
    try {
        const user = await db.User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json(fail({ user: 'Usuario no encontrado.' }));
        }
        res.status(200).json(success(user));
    } catch (err) {
        res.status(500).json(error(err.message));
    }
};

// POST /users (Crear un usuario - usualmente una ruta de admin)
exports.createUser = async (req, res) => {
    try {
        const newUser = await db.User.create(req.body);
        res.status(201).json(success(newUser));
    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json(fail({ email: 'El email ya está registrado.' }));
        }
        res.status(500).json(error(err.message));
    }
};

// PUT /users/:id
exports.updateUser = async (req, res) => {
    try {
        const [updated] = await db.User.update(req.body, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedUser = await db.User.findByPk(req.params.id);
            return res.status(200).json(success(updatedUser));
        }
        throw new Error('Usuario no encontrado.');
    } catch (err) {
        if (err.message === 'Usuario no encontrado.') {
            return res.status(404).json(fail({ user: err.message }));
        }
        res.status(500).json(error(err.message));
    }
};

// DELETE /users/:id
exports.deleteUser = async (req, res) => {
    try {
        const deleted = await db.User.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            return res.status(204).send(); // 204 No Content
        }
        throw new Error('Usuario no encontrado.');
    } catch (err) {
        if (err.message === 'Usuario no encontrado.') {
            return res.status(404).json(fail({ user: err.message }));
        }
        res.status(500).json(error(err.message));
    }
};