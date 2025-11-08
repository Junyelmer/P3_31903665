'use strict';
const now = new Date();

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Categories', [
      { id: 1, name: 'Figuras', description: 'Figuras de colección', createdAt: now, updatedAt: now },
      { id: 2, name: 'Vinilos', description: 'Discos de vinilo', createdAt: now, updatedAt: now }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Categories', null, {});
  }
};
