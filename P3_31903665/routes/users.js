var express = require('express');
var router = express.Router();

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Lista usuarios (ejemplo)
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
