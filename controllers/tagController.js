'use strict';

const { Tag } = require('../models');

exports.getAllTags = async (req, res) => {
  try {
    const tags = await Tag.findAll();
    res.status(200).json({ status: 'success', data: tags });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getTagById = async (req, res) => {
  try {
    const tag = await Tag.findByPk(req.params.id);
    if (!tag) return res.status(404).json({ status: 'fail', data: { message: 'Tag not found' } });
    res.status(200).json({ status: 'success', data: tag });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.createTag = async (req, res) => {
  try {
    const tag = await Tag.create(req.body);
    res.status(201).json({ status: 'success', data: tag });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ status: 'fail', data: { name: 'Tag name must be unique' } });
    }
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.updateTag = async (req, res) => {
  try {
    const tag = await Tag.findByPk(req.params.id);
    if (!tag) return res.status(404).json({ status: 'fail', data: { message: 'Tag not found' } });
    await tag.update(req.body);
    res.status(200).json({ status: 'success', data: tag });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ status: 'fail', data: { name: 'Tag name must be unique' } });
    }
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.deleteTag = async (req, res) => {
  try {
    const tag = await Tag.findByPk(req.params.id);
    if (!tag) return res.status(404).json({ status: 'fail', data: { message: 'Tag not found' } });
    await tag.destroy();
    res.status(200).json({ status: 'success', data: { message: 'Tag deleted successfully' } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
