/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestion de usuarios (Requiere Autenticacion)
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtiene la lista de todos los usuarios (solo datos no sensibles).
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []  # <--- INDICA QUE REQUIERE AUTORIZACION
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente.
 *       401:
 *         description: No autorizado (Token no valido o ausente).
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth'); // Importar el middleware

// Aplicar el middleware 'protect' a TODAS las rutas de /users (Requisito 2 y 4)
router.use(protect);

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Obtiene la lista de todos los usuarios (solo datos no sensibles).
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de usuarios obtenida exitosamente.
 *       '401':
 *         description: No autorizado
 */
router.get('/', userController.getAllUsers); // GET /users

/**
 * @openapi
 * /users:
 *   post:
 *     summary: Crear un nuevo usuario
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       '201':
 *         description: Usuario creado
 */
router.post('/', userController.createUser); // POST /users

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Obtener usuario por id
 *     tags:
 *       - Users
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
 *         description: Usuario encontrado
 *       '404':
 *         description: Usuario no encontrado
 */
router.get('/:id', userController.getUserById); // GET /users/:id

/**
 * @openapi
 * /users/{id}:
 *   put:
 *     summary: Actualizar usuario
 *     tags:
 *       - Users
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
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       '200':
 *         description: Usuario actualizado
 */
router.put('/:id', userController.updateUser); // PUT /users/:id

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     summary: Eliminar usuario
 *     tags:
 *       - Users
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
 *         description: Usuario eliminado
 */
router.delete('/:id', userController.deleteUser); // DELETE /users/:id

module.exports = router;