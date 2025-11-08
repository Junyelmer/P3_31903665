'use strict';
const now = new Date();

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Tags', [
      { id: 1, name: 'Edición Limitada', createdAt: now, updatedAt: now },
      { id: 2, name: 'Retro', createdAt: now, updatedAt: now },
      { id: 3, name: 'Figura 1/6', createdAt: now, updatedAt: now }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Tags', null, {});
  }
};
