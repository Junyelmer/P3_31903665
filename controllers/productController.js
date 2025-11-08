'use strict';

const { Product, Category, Tag } = require('../models');

// Admin: get all products
exports.getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.findAll({ include: [Category, Tag] });
    res.status(200).json({ status: 'success', data: products });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Admin: get product by id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, { include: [Category, Tag] });
    if (!product) return res.status(404).json({ status: 'fail', data: { message: 'Product not found' } });
    res.status(200).json({ status: 'success', data: product });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Admin: create product (associates category and tags)
exports.createProduct = async (req, res) => {
  try {
    const { tags, categoryId, ...payload } = req.body;
    const product = await Product.create({ ...payload, categoryId });

    if (Array.isArray(tags) && tags.length) {
      // setTags accepts array of tag IDs
      await product.setTags(tags);
    }

    const result = await Product.findByPk(product.id, { include: [Category, Tag] });
    res.status(201).json({ status: 'success', data: result });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ status: 'fail', data: { slug: 'Slug or unique constraint conflict' } });
    }
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Admin: update product (can update tags and category)
exports.updateProduct = async (req, res) => {
  try {
    const { tags, categoryId, ...payload } = req.body;
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ status: 'fail', data: { message: 'Product not found' } });

    await product.update({ ...payload, categoryId });

    if (Array.isArray(tags)) {
      await product.setTags(tags);
    }

    const result = await Product.findByPk(product.id, { include: [Category, Tag] });
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ status: 'fail', data: { slug: 'Slug or unique constraint conflict' } });
    }
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Admin: delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ status: 'fail', data: { message: 'Product not found' } });
    await product.destroy();
    res.status(200).json({ status: 'success', data: { message: 'Product deleted successfully' } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
