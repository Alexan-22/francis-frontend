# Arquitectura de Francis Frontend

Referencia: árbol de carpetas de Tienda Sebas aportado por el usuario. Es un **proyecto independiente**, no una copia del repositorio Sebas.

- `src/app/core`: modelos, sesión JWT en memoria, servicios, guards e interceptor.
- `src/app/features`: tienda pública, cuenta, carrito, checkout y áreas administrativas.
- `src/app/layouts`: disposición de tienda pública.
- `src/app/shared`: componentes reutilizables previstos.
- `src/app/features/admin`: panel y POS existentes, además de pantallas preparadas para productos, inventario, usuarios, ventas, reportes y contenidos.

**Datos:** Navegador → Angular HttpClient → `http://localhost:8085` (API Gateway) → microservicios Spring Boot → PostgreSQL. El navegador nunca habla directamente con puertos 8081/8082/8083 o PostgreSQL.

## Estado real

La base pública conserva las pantallas y algunas llamadas REST del prototipo anterior. Los módulos administrativos nuevos son pantallas de integración pendiente, no CRUD funcionales. Los contratos definidos en `docs/backend-contract-gaps.md` son propuestas y deben cotejarse con los controladores reales. Las URLs previstas por sí solas no verifican que existan los endpoints.
