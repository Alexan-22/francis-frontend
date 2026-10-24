# Francis Frontend

Proyecto Angular independiente, basado en la **organización de carpetas** compartida de Tienda Sebas, adaptado a **Francis Collection**. La versión anterior `tienda-francis-frontend` permanece separada.

## Instalación

Requisitos: Node.js compatible con Angular 20, npm.

```bash
npm install
npm start
```

Abrir `http://localhost:4200`. En otra terminal iniciar discovery, auth-service, comercio-service, contenido-service y API Gateway, según sus dependencias.

## Arquitectura

El cliente HTTP usa únicamente `http://localhost:8085`, configurable en `src/app/core/config/api.config.ts`. El Gateway enruta las solicitudes según su propia configuración. Los tokens JWT se mantienen en memoria y se envían solamente al Gateway.

Rutas públicas: `/`, `/tienda`, `/producto/:id`, `/carrito`, `/login`, `/registro`, `/checkout`, `/mis-compras`.

Rutas ADMIN: `/admin`, `/admin/vender`, `/admin/productos`, `/admin/stock`, `/admin/ventas`, `/admin/usuarios`, `/admin/reportes`, `/admin/home-admin`, `/admin/producto-form`, `/admin/clientes-presenciales`.

**Advertencia:** no se simulan ventas, pagos, pedidos ni estadísticas. Los módulos nuevos muestran su estado de integración pendiente. Checkout y POS requieren cotejar contratos reales antes de habilitar escrituras.

Ver `docs/arquitectura.md` y `docs/backend-contract-gaps.md`.
