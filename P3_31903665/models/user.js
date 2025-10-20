'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define association here
    }
    // Metodo para validar la contrasena
    async comparePassword(candidatePassword) {
      return bcrypt.compare(candidatePassword, this.password);
    }
  }
  User.init({
    // Ajustado a nombreCompleto para coincidir con la migración
    nombreCompleto: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    email: { 
      type: DataTypes.STRING, 
      unique: true, 
      allowNull: false, 
      validate: { isEmail: true } 
    },
    password: { 
      type: DataTypes.STRING, 
      allowNull: false 
    }
  }, {
    sequelize,
    modelName: 'User',
    hooks: {
      // HOOK: Hashing de contrasena antes de guardar
      beforeCreate: async (user) => {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  // IMPORTANTE: Este método asegura que la contraseña nunca se incluya en las respuestas JSON
  User.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password;
    return values;
  };

  return User;
};