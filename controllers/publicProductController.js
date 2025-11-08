'use strict';

const { Product, Category, Tag } = require('../models');
const productRepository = require('../services/productRepository');
const { generateSlug } = require('../utils/slug');

// Public: list products with pagination and filters
exports.list = async (req, res) => {
  try {
    const filters = {
      page: req.query.page,
      limit: req.query.limit,
      category: req.query.category,
      tags: req.query.tags,
      price_min: req.query.price_min,
      price_max: req.query.price_max,
      search: req.query.search,
      brand: req.query.brand
    };

    const { products, total, page, limit } = await productRepository.findAndCount(filters);

    res.status(200).json({ status: 'success', data: products, meta: { total, page, limit } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Public: get product by id and slug with self-healing (301 redirect if slug mismatch)
exports.getByIdAndSlug = async (req, res) => {
  try {
    // Debug: show raw request info to diagnose param parsing issues
    console.log('RAW REQ:', {
      url: req.url,
      originalUrl: req.originalUrl,
      path: req.path,
      params: req.params
    });
    // Robust parsing: when router splits on hyphens strangely the params may be
    // id: '1-test', slug: 'product'. Parse raw path to reliably extract id and slug
    // using the first '-' as separator.
    let id;
    let providedSlug;
    const rawPath = (req.path || '').replace(/^\//, ''); // e.g. '1-test-product'
    if (rawPath && rawPath.includes('-')) {
      const idx = rawPath.indexOf('-');
      const idStr = rawPath.slice(0, idx);
      providedSlug = rawPath.slice(idx + 1);
      id = parseInt(idStr, 10);
    } else {
      // fallback to params (normal case)
      id = parseInt(req.params.id, 10);
      providedSlug = req.params.slug;
    }

    const product = await Product.findByPk(id, { include: [Category, Tag] });
    if (!product) return res.status(404).json({ status: 'fail', data: { message: 'Product not found' } });

    // Normalize both slugs before comparison to avoid minor differences
    const stored = String(product.slug || '');
    const provided = String(providedSlug || '');
    console.log('Comparing slugs:', { stored, provided, normStored: generateSlug(stored), normProvided: generateSlug(provided) });

    if (generateSlug(stored) !== generateSlug(provided)) {
      // Self-healing: redirect to canonical URL
      const correctUrl = `/p/${product.id}-${product.slug}`;
      return res.redirect(301, correctUrl);
    }

    res.status(200).json({ status: 'success', data: product });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
