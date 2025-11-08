/**
 * Routes for managing categories (protected)
 */
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');

// Apply protection to all category routes
router.use(protect);

/**
 * @openapi
 * /categories:
 *   get:
 *     summary: Obtener lista de categorías
 *     tags:
 *       - Admin - Categories
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de categorías
 */
router.get('/', categoryController.getAllCategories);

/**
 * @openapi
 * /categories:
 *   post:
 *     summary: Crear nueva categoría
 *     tags:
 *       - Admin - Categories
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
 *     responses:
 *       '201':
 *         description: Categoría creada
 */
router.post('/', categoryController.createCategory);

/**
 * @openapi
 * /categories/{id}:
 *   get:
 *     summary: Obtener categoría por id
 *     tags:
 *       - Admin - Categories
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
 *         description: Categoría encontrada
 *       '404':
 *         description: No encontrada
 */
router.get('/:id', categoryController.getCategoryById);

/**
 * @openapi
 * /categories/{id}:
 *   put:
 *     summary: Actualizar categoría
 *     tags:
 *       - Admin - Categories
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
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       '200':
 *         description: Actualizado
 */
router.put('/:id', categoryController.updateCategory);

/**
 * @openapi
 * /categories/{id}:
 *   delete:
 *     summary: Eliminar categoría
 *     tags:
 *       - Admin - Categories
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
 *         description: Eliminado
 */
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
