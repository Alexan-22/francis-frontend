# Brechas de integración (pendientes, no endpoints confirmados)

**IMPORTANTE:** El listado del usuario define familias de rutas, pero no prueba métodos, DTO ni comportamiento. No declarar las rutas propuestas como existentes.

| Capacidad | Hipótesis por verificar | Estado en este entregable |
| --- | --- | --- |
| Listado de productos | `GET /api/productos?page=0&search=...` devuelve arreglo o `{content:[]}` | Implementación tentativa, verificar filtro y paginación |
| Detalle de producto | `GET /api/productos/{id}` con `idProducto`, `nombre`, `precio`, `tallas` | Implementación tentativa, verificar DTO |
| Autenticación | `POST /api/auth/login` con `correo` y `clave`; token y usuario/rol | Implementación tentativa, verificar credenciales y campos |
| Registro | `POST /api/auth/registro` con `nombres`, `apellidos`, `correo`, `contrasena` | Implementación tentativa, verificar DTO y validaciones |
| Banners/colecciones | Familia `/api/home/**` | Pendiente de integración |
| Filtros de catálogo | Género, categoría, talla, ofertas, orden, total de página | Pendiente; UI inicial no los aplica, salvo búsqueda tentativa |
| Cotización de envío | Ruta, localización, moneda, cobertura, firma de cotización | Falta contrato; checkout bloqueado |
| Creación de pedido | Ruta, DTO, idempotencia, respuesta verificable, consulta por ID | Falta contrato; checkout bloqueado |
| Pedidos del cliente | Ruta, permisos, detalle e historial | Falta contrato; no mostrar pedidos falsos |
| Venta POS | Método, DTO, medio, cliente, idempotencia, resultado | Falta contrato; venta bloqueada |
| Devoluciones/pagos | Estados válidos, permisos, contrato idempotente | Falta contrato; sin acciones inventadas |
| Inventario/usuarios/reportes | DTO, paginación, roles, control de concurrencia | Falta contrato; sin estadísticas inventadas |

## Trabajo pendiente

1. Obtener código fuente de `tienda-sebas-frontend` y comparar rutas/componentes existentes.
2. Obtener controladores, DTO y/o OpenAPI de `tienda-francis-backend` antes de habilitar escrituras.
3. Reconciliar DTO reales con `src/app/core/models/models.ts`.
4. Completar pantallas administrativas y clientela, sin quitar funciones de la aplicación anterior.
5. Probar integración real contra `http://localhost:8085`; configurar CORS en Gateway.
6. Agregar pruebas de carrito, guardas, auth e idempotencia, y pruebas E2E.

**No se comprobó** compatibilidad del repositorio original ni se ejecutó instalación/build por limitaciones de acceso externo del entorno.
