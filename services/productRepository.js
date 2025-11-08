'use strict';

const { Product, Category, Tag, Sequelize } = require('../models');
const Op = Sequelize.Op;

/**
 * Build dynamic query for products based on provided filters.
 * Supported filters: category (id), tags (array), price_min, price_max, search, brand
 * Pagination: page, limit
 */
async function findAndCount(filters = {}) {
  const page = parseInt(filters.page, 10) || 1;
  const limit = parseInt(filters.limit, 10) || 10;
  const offset = (page - 1) * limit;

  const where = {};
  const include = [Category, Tag];

  if (filters.category) where.categoryId = filters.category;

  if (filters.price_min || filters.price_max) {
    where.price = {};
    if (filters.price_min) where.price[Op.gte] = filters.price_min;
    if (filters.price_max) where.price[Op.lte] = filters.price_max;
  }

  if (filters.search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${filters.search}%` } },
      { description: { [Op.like]: `%${filters.search}%` } }
    ];
  }

  if (filters.brand) where.brand = filters.brand;

  if (filters.tags) {
    const tagIds = Array.isArray(filters.tags) ? filters.tags : String(filters.tags).split(',').map(Number).filter(Boolean);
    if (tagIds.length) {
      // When filtering by tags, include Tag and require matching
      include[1] = { model: Tag, where: { id: tagIds } };
    }
  }

  const result = await Product.findAndCountAll({
    where,
    include,
    limit,
    offset,
    distinct: true,
    order: [['createdAt', 'DESC']]
  });

  return {
    products: result.rows,
    total: result.count,
    page,
    limit
  };
}

module.exports = { findAndCount };
