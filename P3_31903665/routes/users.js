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

// Rutas protegidas (Requisito 2: CRUD)
router.get('/', userController.getAllUsers); // GET /users
router.get('/:id', userController.getUserById); // GET /users/:id
router.post('/', userController.createUser); // POST /users
router.put('/:id', userController.updateUser); // PUT /users/:id
router.delete('/:id', userController.deleteUser); // DELETE /users/:id

module.exports = router;