/**
 * Public routes for product listing and self-healing product URLs
 */
const express = require('express');
const router = express.Router();
const publicProductController = require('../controllers/publicProductController');

// Quick router-level debug to see what paths arrive here (helps diagnose 404 before handler)
router.use((req, res, next) => {
	try {
		console.log('PUBLIC_PRODUCTS ROUTER:', { baseUrl: req.baseUrl, path: req.path, params: req.params, originalUrl: req.originalUrl });
	} catch (e) {}
	next();
});

// Public listing with filters (GET /products)
router.get('/', publicProductController.list);

/**
 * @openapi
 * /products:
 *   get:
 *     summary: Lista pública de productos con paginación y filtros
 *     tags:
 *       - Public - Products
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: category
 *         schema:
 *           type: integer
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Comma-separated tag IDs, e.g. 1,2,3
 *       - in: query
 *         name: price_min
 *         schema:
 *           type: number
 *       - in: query
 *         name: price_max
 *         schema:
 *           type: number
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Lista paginada de productos
 */
router.get('/', publicProductController.list);

/**
 * @openapi
 * /p/{id}-{slug}:
 *   get:
 *     summary: Obtener producto público por id y slug (self-healing)
 *     tags:
 *       - Public - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Producto retornado correctamente
 *       '301':
 *         description: Redirección a la URL canónica si el slug difiere
 *       '404':
 *         description: Producto no encontrado
 */
router.get('/:id-:slug', publicProductController.getByIdAndSlug);

module.exports = router;
