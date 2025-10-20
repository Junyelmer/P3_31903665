require('dotenv').config(); // Carga las variables de entorno
// La siguiente línea es importante para inicializar la conexión a la BD
const db = require('./models'); // <-- Debe ser './models' si ambos están en la raíz

var express = require('express');
var path = require('path'); // asegúrate de tener esto al inicio
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
            description: 'Documentación de los endpoints de la asignación de la P3.',
        },
        servers: [{ url: '/' }],
        components: {
            securitySchemes: {
                bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
            }
        }
    },
    apis: [
        require('path').join(__dirname, 'app.js'),
        require('path').join(__dirname, 'routes', '*.js')
    ]
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);

// --- Importación de Rutas ---
// var indexRouter = require('./routes/index'); // (si existe) 
const authRouter = require(path.join(__dirname, 'routes', 'auth')); // <-- ahora robusto
const usersRouter = require(path.join(__dirname, 'routes', 'users')); // <-- ahora robusto

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// --- Montaje de Rutas ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
app.use('/auth', authRouter); // Rutas públicas: /auth/register, /auth/login
app.use('/users', usersRouter); // Rutas protegidas con JWT

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

// NO INICIES EL SERVIDOR AQUÍ; exporta la app para tests y bin/www
module.exports = app;
