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
const { protect } = require('../middlewares/authMiddleware'); // IMPORTANTE

// Aplica proteccion a todas las rutas de /users
router.use(protect);

router.get('/', userController.getAllUsers);

module.exports = router;