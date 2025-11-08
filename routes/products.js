/**
 * Routes for managing products (protected for management endpoints)
 */
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middleware/auth');

// Management routes (protected)
router.use(protect);

/**
 * @openapi
 * /products:
 *   get:
 *     summary: Obtener lista de productos (administración)
 *     tags:
 *       - Admin - Products
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de productos
 */
router.get('/', productController.getAllProductsAdmin);

/**
 * @openapi
 * /products:
 *   post:
 *     summary: Crear producto (administración)
 *     tags:
 *       - Admin - Products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               sku:
 *                 type: string
 *               brand:
 *                 type: string
 *               categoryId:
 *                 type: integer
 *               tags:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       '201':
 *         description: Producto creado
 */
router.post('/', productController.createProduct);

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     summary: Obtener producto por id (administración)
 *     tags:
 *       - Admin - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Producto encontrado
 */
router.get('/:id', productController.getProductById);

/**
 * @openapi
 * /products/{id}:
 *   put:
 *     summary: Actualizar producto (administración)
 *     tags:
 *       - Admin - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       '200':
 *         description: Producto actualizado
 */
router.put('/:id', productController.updateProduct);

/**
 * @openapi
 * /products/{id}:
 *   delete:
 *     summary: Eliminar producto (administración)
 *     tags:
 *       - Admin - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Producto eliminado
 */
router.delete('/:id', productController.deleteProduct);

module.exports = router;
