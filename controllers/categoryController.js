'use strict';

const { Category } = require('../models');

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.status(200).json({ status: 'success', data: categories });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ status: 'fail', data: { message: 'Category not found' } });
    res.status(200).json({ status: 'success', data: category });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ status: 'success', data: category });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ status: 'fail', data: { name: 'Category name must be unique' } });
    }
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ status: 'fail', data: { message: 'Category not found' } });
    await category.update(req.body);
    res.status(200).json({ status: 'success', data: category });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ status: 'fail', data: { name: 'Category name must be unique' } });
    }
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ status: 'fail', data: { message: 'Category not found' } });
    await category.destroy();
    res.status(200).json({ status: 'success', data: { message: 'Category deleted successfully' } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
