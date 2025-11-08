'use strict';

const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Token secreto, debe ser cargado desde variables de entorno
const JWT_SECRET = process.env.JWT_SECRET || 'mi_clave_secreta_super_segura';

// POST /auth/register
exports.register = async (req, res) => {
    try {
        // El hashing se hace en el hook del modelo user.js
        const user = await User.create(req.body);

        // Generar JWT
        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });

        // Respuesta JSend
        res.status(201).json({
            status: 'success',
            data: {
                user: {
                    id: user.id,
                    nombreCompleto: user.nombreCompleto,
                    email: user.email
                },
                token
            }
        });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ status: 'error', message: 'El email ya está registrado.' });
        }
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// POST /auth/login
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ status: 'error', message: 'Credenciales inválidas' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ status: 'error', message: 'Credenciales inválidas' });
        }

        // Generar JWT
        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });

        res.status(200).json({
            status: 'success',
            data: {
                user: {
                    id: user.id,
                    nombreCompleto: user.nombreCompleto,
                    email: user.email
                },
                token
            }
        });

    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};