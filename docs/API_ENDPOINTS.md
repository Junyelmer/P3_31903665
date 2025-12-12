# Guia Completa de Endpoints

> **Base URL local:** http://localhost:3000
>
> **Produccion Render:** reemplaza con la URL desplegada (por ejemplo, https://tu-app.onrender.com). Todas las rutas son relativas a la base.

Respuestas en formato **JSend**:

```json
{
  "status": "success|fail|error",
  "data": { "..." }
}
```

Para rutas protegidas agrega `Authorization: Bearer <JWT>`.

---

## Auth

### POST /auth/register

```json
{
  "nombreCompleto": "Gabriel Andres",
  "email": "user@example.com",
  "password": "12345678"
}
```

**Respuesta 201**: `status = success` con los datos del usuario y token JWT.

### POST /auth/login

```json
{
  "email": "user@example.com",
  "password": "12345678"
}
```

**Respuesta 200**: igual que registro.

---

## Usuarios (JWT)

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | /users | Lista usuarios |
| POST | /users | Crear usuario |
| GET | /users/{id} | Detalle |
| PUT | /users/{id} | Actualizar |
| DELETE | /users/{id} | Eliminar |

Body POST/PUT:

```json
{
  "nombreCompleto": "Nuevo Usuario",
  "email": "otro@example.com",
  "password": "PwdSegura123"
}
```

---

## Productos Publicos

### GET /products
Filtros opcionales: `page`, `limit`, `category`, `tags` ("1,2"), `price_min`, `price_max`, `search`, `brand`.

### GET /p/{id}-{slug}
Devuelve el producto y redirige (301) si el slug no coincide.

---

## Productos Administracion (JWT)

| Metodo | Ruta |
| --- | --- |
| GET | /products |
| POST | /products |
| GET | /products/{id} |
| PUT | /products/{id} |
| DELETE | /products/{id} |

Body POST/PUT:

```json
{
  "name": "Laptop X",
  "description": "Equipo de pruebas",
  "price": 999.99,
  "stock": 12,
  "sku": "LAP-001",
  "brand": "ACME",
  "categoryId": 3,
  "tags": [1, 2]
}
```

---

## Categorias (JWT)

| Metodo | Ruta |
| --- | --- |
| GET | /categories |
| POST | /categories |
| GET | /categories/{id} |
| PUT | /categories/{id} |
| DELETE | /categories/{id} |

Body POST/PUT:

```json
{
  "name": "Electronica",
  "description": "Todo lo relacionado con gadgets"
}
```

---

## Tags (JWT)

| Metodo | Ruta |
| --- | --- |
| GET | /tags |
| POST | /tags |
| GET | /tags/{id} |
| PUT | /tags/{id} |
| DELETE | /tags/{id} |

Body POST/PUT:

```json
{
  "name": "gaming"
}
```

---

## Ordenes (JWT)

### POST /orders

```json
{
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 5, "quantity": 1 }
  ],
  "paymentMethod": "CreditCard",
  "paymentDetails": {
    "cardNumber": "4111111111111111",
    "cvv": "123",
    "expirationMonth": "01",
    "expirationYear": "2030",
    "fullName": "Smoke Tester",
    "description": "Compra en línea",
    "reference": "order-123",
    "currency": "USD"
  }
}
```

- 201 `success`: orden completada y stock actualizado.
- 400 `fail`: validacion o stock insuficiente.
- 402 `fail`: pago rechazado por el proveedor.
- Configura la variable de entorno `FAKE_PAYMENT_TOKEN` con el token emitido por FakePayment para autorizar las solicitudes.

### GET /orders

Query params: `page`, `limit`.

```json
{
  "status": "success",
  "data": {
    "orders": [ { "id": 1, "status": "COMPLETED", "items": [] } ],
    "meta": { "total": 1, "page": 1, "limit": 10, "totalPages": 1 }
  }
}
```

### GET /orders/{id}
Devuelve una orden solo si pertenece al usuario autenticado (404 en caso contrario).

---

## Rutas Generales

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | /about | Datos del desarrollador |
| GET | /ping | Health check simple |
| GET | /health | Health check para Render |

---

## Ejemplo rapido con `curl`

```bash
BASE_URL=http://localhost:3000

# Login y guardar token
TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"12345678"}' | jq -r '.data.token')

# Crear orden
curl -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "items":[{"productId":1,"quantity":2}],
    "paymentMethod":"CreditCard",
    "paymentDetails":{
      "cardNumber":"4111111111111111",
      "cvv":"123",
      "expirationMonth":"01",
      "expirationYear":"2030",
      "fullName":"Tester",
      "description":"Orden demo",
      "reference":"order-demo-1",
      "currency":"USD"
    }
  }'
```
