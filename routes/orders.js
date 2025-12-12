/**
 * Routes for order management (protected /orders resource)
 */
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.use(protect);

/**
 * @openapi
 * /orders:
 *   post:
 *     summary: Crear una nueva orden y procesar su pago
 *     description: >-
 *       Operación transaccional que valida stock, procesa el pago usando la estrategia correspondiente y
 *       crea la orden con sus items. Si falla cualquier paso, se realiza rollback completo.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - paymentMethod
 *               - paymentDetails
 *             properties:
 *               items:
 *                 type: array
 *                 description: Lista de productos a comprar.
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *               paymentMethod:
 *                 type: string
 *                 example: CreditCard
 *               paymentDetails:
 *                 type: object
 *                 description: Datos específicos del método de pago (ej. token de tarjeta, moneda).
 *     responses:
 *       '201':
 *         description: Orden creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       '400':
 *         description: Error de validación o stock insuficiente
 *       '402':
 *         description: Pago rechazado
 */
router.post('/', orderController.createOrder);

/**
 * @openapi
 * /orders:
 *   get:
 *     summary: Listar órdenes del usuario autenticado
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Lista paginada de órdenes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     orders:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Order'
 *                     meta:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 */
router.get('/', orderController.getOrders);

/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     summary: Obtener detalle de una orden
 *     tags:
 *       - Orders
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
 *         description: Orden encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 */
router.get('/:id', orderController.getOrderById);

module.exports = router;
