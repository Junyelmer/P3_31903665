var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// Swagger: importar después de otras importaciones de módulos
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Opciones de configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Asignación P3',
      version: '1.0.0',
      description: 'Documentación de los endpoints de la asignación de la P3 (sobre y ping).',
    },
    servers: [
      {
        url: '/', // La ruta base
      },
    ],
  },
  // Especifica qué archivos deben ser analizados para buscar comentarios JSDoc
  apis: ['./app.js', './routes/*.js'], // Añadir rutas si hay endpoints en /routes
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Configuración del endpoint de la documentación
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// ------------------------------------------------------------------
// Documentación y implementación de GET /about
// ------------------------------------------------------------------
/**
 * @openapi
 * /about:
 *   get:
 *     summary: Información del Desarrollador
 *     description: Retorna los datos del desarrollador en el formato JSend "success".
 *     responses:
 *       200:
 *         description: Datos del desarrollador retornados exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     nombreCompleto:
 *                       type: string
 *                       example: Tu Nombre Completo
 *                     cedula:
 *                       type: string
 *                       example: 12345678
 *                     seccion:
 *                       type: string
 *                       example: V01
 */
app.get('/about', function(req, res, next) {
  // ⚠ Reemplaza con tus datos reales si lo deseas
  const miInfo = {
    nombreCompleto: "Gabriel Andres Ochoa Padron",
    cedula: "31903665",
    seccion: "2"
  };

  // Respuesta JSend (status: success, data: objeto)
  res.json({
    status: "success",
    data: miInfo
  });
});
// ------------------------------------------------------------------

// ------------------------------------------------------------------
// Documentación y implementación de GET /ping
// ------------------------------------------------------------------
/**
 * @openapi
 * /ping:
 *   get:
 *     summary: Health Check
 *     description: Responde con un estado 200 OK y cuerpo vacío para verificar que el servicio esté activo.
 *     responses:
 *       200:
 *         description: OK. El servicio está activo.
 */
app.get('/ping', function(req, res, next) {
  // Solo código 200 OK y cuerpo vacío
  res.status(200).send();
});
// ------------------------------------------------------------------

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
