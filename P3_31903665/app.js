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
            title: 'API de Asignación P3 - Gabriel Ochoa',
            version: '1.0.0',
            description: 'Documentación de los endpoints de la asignación de la P3.',
            contact: {
                name: "Gabriel Andres Ochoa Padron",
                email: "31903665"
            }
        },
        servers: [
            { 
                url: '/',
                description: 'Servidor principal'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: { 
                    type: 'http', 
                    scheme: 'bearer', 
                    bearerFormat: 'JWT' 
                }
            }
        }
    },
    apis: [
        './app.js',
        './routes/*.js'
    ]
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);

// --- Importación de Rutas ---
// var indexRouter = require('./routes/index'); // (si existe) 
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

var app = express();

app.use(logger('dev'));

// ESTAS LÍNEAS SON CRUCIALES PARA EL ERROR 400 (Bad Request)
// Tu configuración actual con límite de 10mb es robusta, pero verifica que sea esta:
app.use(express.json({ limit: '10mb' })); // Lee cuerpos de solicitud en formato JSON
app.use(express.urlencoded({ extended: false, limit: '10mb' })); // Lee cuerpos de solicitud URL-encoded

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// --- Montaje de Rutas ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
app.use('/auth', authRoutes); // Ruta para registro y login
app.use('/users', userRoutes); // Ruta para gestión de usuarios

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
// Documentación Swagger completa
// ------------------------------------------------------------------

/**
 * @openapi
 * tags:
 *   - name: General
 *     description: Endpoints generales de la API
 *   - name: Auth
 *     description: Autenticación de usuarios
 *   - name: Users
 *     description: Gestión de usuarios (requiere autenticación)
 */

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombreCompleto
 *               - email
 *               - password
 *             properties:
 *               nombreCompleto:
 *                 type: string
 *                 example: "Gabriel Andres Ochoa Padron"
 *               email:
 *                 type: string
 *                 example: "gabriel@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
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
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         nombreCompleto:
 *                           type: string
 *                         email:
 *                           type: string
 *                     token:
 *                       type: string
 *       400:
 *         description: Error en los datos de entrada
 */

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "gabriel@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales inválidas
 */

// Ruta de health check para Render
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'API is running successfully',
    timestamp: new Date().toISOString()
  });
});

module.exports = app;