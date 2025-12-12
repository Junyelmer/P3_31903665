require('dotenv').config(); // Carga las variables de entorno
// La siguiente línea es importante para inicializar la conexión a la BD
const db = require('./models'); // <-- Debe ser './models' si ambos están en la raíz

const dbReady = process.env.NODE_ENV === 'test'
    ? Promise.resolve()
    : db.sequelize.sync()
        .then(() => {
            // eslint-disable-next-line no-console
            console.log('Database synchronized');
        })
        .catch((err) => {
            // eslint-disable-next-line no-console
            console.error('Database synchronization failed:', err.message);
            throw err;
        });

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
            description: 'Documentación OpenAPI generada para el proyecto P3. Contiene todas las rutas públicas y protegidas.',
            contact: {
                name: 'Gabriel Andres Ochoa Padron',
                email: '31903665'
            }
        },
        servers: [
            {
                url: '/',
                description: 'Servidor local (ruta base)'
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
    // swagger-jsdoc will scan these files for JSDoc/OpenAPI comments
    apis: ['./app.js', './routes/*.js']
};

// Generar especificación OpenAPI desde los JSDoc usando las opciones definidas
const swaggerSpecs = swaggerJsdoc(swaggerOptions);

// --- Importación de Rutas ---
// var indexRouter = require('./routes/index'); // (si existe) 
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const tagRoutes = require('./routes/tags');
const publicProductRoutes = require('./routes/publicProducts');
const orderRoutes = require('./routes/orders');

var app = express();

app.use(logger('dev'));

// ESTAS LÍNEAS SON CRUCIALES PARA EL ERROR 400 (Bad Request)
// Tu configuración actual con límite de 10mb es robusta, pero verifica que sea esta:
app.use(express.json({ limit: '10mb' })); // Lee cuerpos de solicitud en formato JSON
app.use(express.urlencoded({ extended: false, limit: '10mb' })); // Lee cuerpos de solicitud URL-encoded

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// --- Montaje de Rutas ---
// Serve Swagger UI pointing to the static openapi.yaml file included in the repo.
// We pass `null` as the spec and set `swaggerOptions.url` so the UI will fetch
// the YAML from `/openapi.yaml` (no additional YAML parser dependency required).
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(null, { swaggerOptions: { url: '/openapi.yaml' } }));
// Servir el archivo OpenAPI YAML estático para clientes o despliegue
app.get('/openapi.yaml', (req, res) => {
    res.sendFile(path.join(__dirname, 'openapi.yaml'));
});
app.use('/auth', authRoutes); // Ruta para registro y login
app.use('/users', userRoutes); // Ruta para gestión de usuarios
app.use('/orders', orderRoutes); // Gestión de órdenes (protegida)
// Public product listing and self-healing endpoints mounted BEFORE management routes
// Mount public listing at /products (public) and self-healing at /p
app.use('/products', publicProductRoutes);
app.use('/p', publicProductRoutes);

// Management routes (protected)
app.use('/products', productRoutes); // Gestión de productos (protegida)
app.use('/categories', categoryRoutes); // Gestión de categorías (protegida)
app.use('/tags', tagRoutes); // Gestión de tags (protegida)

app.dbReady = dbReady;

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
 *   - name: Public - Products
 *     description: Endpoints públicos para productos
 *   - name: Admin - Products
 *     description: Endpoints de administración para productos (requieren JWT)
 *   - name: Admin - Categories
 *     description: Endpoints de administración para categorías y tags (requieren JWT)
 *   - name: Orders
 *     description: Gestión y consulta de órdenes (requiere JWT)
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         description:
 *           type: string
 *     Tag:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *           format: float
 *         stock:
 *           type: integer
 *         sku:
 *           type: string
 *         brand:
 *           type: string
 *         slug:
 *           type: string
 *         categoryId:
 *           type: integer
 *         category:
 *           $ref: '#/components/schemas/Category'
 *         tags:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Tag'
 *     OrderItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         orderId:
 *           type: integer
 *         productId:
 *           type: integer
 *         quantity:
 *           type: integer
 *         unitPrice:
 *           type: number
 *           format: float
 *         product:
 *           $ref: '#/components/schemas/Product'
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         userId:
 *           type: integer
 *         status:
 *           type: string
 *           enum: ['PENDING', 'COMPLETED', 'CANCELED', 'PAYMENT_FAILED']
 *         totalAmount:
 *           type: number
 *           format: float
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 */

/**
 * @openapi
 * /products:
 *   get:
 *     summary: Lista pública de productos con paginación y filtros
 *     tags: [Public - Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: category
 *         schema:
 *           type: integer
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *           description: Comma-separated tag IDs, e.g. 1,2,3
 *       - in: query
 *         name: price_min
 *         schema:
 *           type: number
 *       - in: query
 *         name: price_max
 *         schema:
 *           type: number
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista paginada de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 */

/**
 * @openapi
 * /p/{id}-{slug}:
 *   get:
 *     summary: Obtener producto público por id y slug (self-healing)
 *     tags: [Public - Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Producto retornado correctamente
 *       301:
 *         description: Redirección a la URL canónica si el slug difiere
 *       404:
 *         description: Producto no encontrado
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