'use strict';

const { User } = require('../models');

// GET /users (Protegida)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      status: 'success',
      data: users
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// POST /users
exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { 
        id: user.id, 
        nombreCompleto: user.nombreCompleto,
        email: user.email 
      }
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ 
        status: 'fail', 
        data: { email: 'El email ya está registrado.' } 
      });
    }
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// GET /users/:id
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ 
        status: 'fail', 
        data: { message: 'Usuario no encontrado' } 
      });
    }

    res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// PUT /users/:id
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        status: 'fail', 
        data: { message: 'Usuario no encontrado' } 
      });
    }

    await user.update(req.body);
    
    res.status(200).json({
      status: 'success',
      data: {
        id: user.id,
        nombreCompleto: user.nombreCompleto,
        email: user.email
      }
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ 
        status: 'fail', 
        data: { email: 'El email ya está registrado.' } 
      });
    }
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// DELETE /users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        status: 'fail', 
        data: { message: 'Usuario no encontrado' } 
      });
    }

    await user.destroy();
    
    res.status(200).json({
      status: 'success',
      data: { message: 'Usuario eliminado correctamente' }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};