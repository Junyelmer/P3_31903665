'use strict';
const { generateSlug } = require('../utils/slug');
const now = new Date();

module.exports = {
  async up (queryInterface, Sequelize) {
    // Insert products with explicit IDs for easy association in ProductTags
    await queryInterface.bulkInsert('Products', [
      {
        id: 1,
        name: 'Figura Genial',
        description: 'Figura de colección genial',
        price: 49.99,
        stock: 10,
        sku: 'FIG-001',
        brand: 'Acme',
        slug: generateSlug('Figura Genial'),
        categoryId: 1,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 2,
        name: 'Vinilo Retro',
        description: 'Vinilo edición retro',
        price: 29.99,
        stock: 5,
        sku: 'VIN-001',
        brand: 'OldSound',
        slug: generateSlug('Vinilo Retro'),
        categoryId: 2,
        createdAt: now,
        updatedAt: now
      }
    ], {});

    // ProductTags relations
    await queryInterface.bulkInsert('ProductTags', [
      { productId: 1, tagId: 1, createdAt: now, updatedAt: now },
      { productId: 1, tagId: 3, createdAt: now, updatedAt: now },
      { productId: 2, tagId: 2, createdAt: now, updatedAt: now }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ProductTags', null, {});
    await queryInterface.bulkDelete('Products', null, {});
  }
};
