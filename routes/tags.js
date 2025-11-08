/**
 * Routes for managing tags (protected)
 */
const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const { protect } = require('../middleware/auth');

router.use(protect);

/**
 * @openapi
 * /tags:
 *   get:
 *     summary: Obtener lista de tags
 *     tags:
 *       - Admin - Categories
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de tags
 */
router.get('/', tagController.getAllTags);

/**
 * @openapi
 * /tags:
 *   post:
 *     summary: Crear tag
 *     tags:
 *       - Admin - Categories
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Tag'
 *     responses:
 *       '201':
 *         description: Tag creado
 */
router.post('/', tagController.createTag);

/**
 * @openapi
 * /tags/{id}:
 *   get:
 *     summary: Obtener tag por id
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
 *         description: Tag encontrado
 */
router.get('/:id', tagController.getTagById);

/**
 * @openapi
 * /tags/{id}:
 *   put:
 *     summary: Actualizar tag
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
 *             $ref: '#/components/schemas/Tag'
 *     responses:
 *       '200':
 *         description: Tag actualizado
 */
router.put('/:id', tagController.updateTag);

/**
 * @openapi
 * /tags/{id}:
 *   delete:
 *     summary: Eliminar tag
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
 *         description: Tag eliminado
 */
router.delete('/:id', tagController.deleteTag);

module.exports = router;
