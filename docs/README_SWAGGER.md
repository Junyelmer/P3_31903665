Swagger / OpenAPI
=================

Este proyecto incluye la especificación OpenAPI completa en `openapi.yaml` y una interfaz interactiva disponible en `/api-docs`.

Archivos añadidos
- `openapi.yaml`: Especificación OpenAPI 3.0 que documenta todas las rutas del proyecto.

Cómo usar
---------

1. Instalar dependencias (si no están instaladas):

```powershell
npm install
```

2. Ejecutar la aplicación en tu entorno de desarrollo:

```powershell
npm run dev
```

3. Abrir la documentación en el navegador:

- Interfaz Swagger UI: http://localhost:3000/api-docs
- Archivo OpenAPI (YAML): http://localhost:3000/openapi.yaml

Notas
-----
- Las rutas protegidas requieren un token JWT en el encabezado `Authorization: Bearer <token>`.
- Si quieres que la UI de Swagger consuma directamente `openapi.yaml`, puedes abrir `/openapi.yaml` y cargarlo en Swagger Editor o configurar Swagger UI para apuntar a esa URL.
