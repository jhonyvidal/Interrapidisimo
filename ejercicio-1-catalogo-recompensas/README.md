# Ejercicio 1 — Catálogo con sistema de recompensas

Mini e-commerce con backend propio en NestJS y frontend en Angular 19 + Angular Material. Los usuarios se registran, navegan el catálogo, agregan productos al carrito y ganan puntos por interactuar con la tienda. Las reglas de puntos viven exclusivamente en el servidor.

## Stack

- **Backend:** NestJS 11 + TypeScript, SQLite (`better-sqlite3`) vía TypeORM, autenticación JWT (Passport), validación con `class-validator`.
- **Frontend:** Angular 19 (standalone components, Signals), Angular Material, RxJS.

## Instrucciones de ejecución

Requiere Node.js 22+. Backend y frontend son proyectos independientes con su propio `package.json`.

### Backend

```bash
cd ejercicio-1-catalogo-recompensas/backend
npm install
cp .env.example .env
npm run start:dev
```

Levanta en `http://localhost:3000`. Al arrancar por primera vez crea `catalogo.sqlite` en la carpeta del backend y siembra 16 productos en 4 categorías (Tecnología, Hogar, Ropa, Deportes). No hace falta ningún paso manual de seed.

### Frontend

```bash
cd ejercicio-1-catalogo-recompensas/frontend
npm install
npm start
```

Levanta en `http://localhost:4200` y consume el backend en `http://localhost:3000` (URL fija en `src/app/core/api.config.ts`, ver "Supuestos y recortes"). El backend debe estar corriendo antes de abrir el frontend.

No hay usuarios precargados: hay que registrarse desde `/registro`.

## Decisiones de arquitectura

- **SQLite + TypeORM** en vez de solo memoria: persiste entre reinicios del servidor y usa entidades con decorators nativos de Nest, sin el overhead de configurar Postgres/Mongo para un take-home. `synchronize: true` reemplaza a las migraciones formales (ver recortes).
- **Autenticación JWT (plus no pedido explícitamente en el enunciado, agregado como capa de seguridad):** registro/login públicos; el resto de acciones (carrito, favoritos, checkout, `/users/me`) requieren `Authorization: Bearer <token>`. El catálogo (`GET /products`) queda público para poder navegar sin sesión, patrón estándar de e-commerce. Puntos y carrito quedan atados al `userId` que viene del token, nunca a un id que mande el cliente — así tampoco se puede operar en nombre de otro usuario.
- **Ledger de puntos (`PointsTransaction`)** en vez de un contador plano: cada acción que otorga puntos queda registrada (usuario, acción, puntos, referencia, fecha). Es más código que `user.points += n`, pero es auditable y permite recalcular el saldo si algo se desincroniza. El saldo en `User.pointsBalance` es un cache que se actualiza en la misma transacción de base de datos que el insert del ledger.
- **Checkout transaccional:** valida stock de cada línea del carrito, recalcula el total con los precios *actuales* del servidor (nunca con lo que mande el cliente), descuenta stock, vacía el carrito y otorga puntos — todo dentro de una única transacción de TypeORM. Si falla cualquier paso, no queda stock descontado a medias.
- **Filtro de excepciones global:** cualquier error (validación, 404, 401, 409, excepción no controlada) responde con el mismo cuerpo `{ statusCode, message, error, timestamp, path }`, con `error` normalizado a la frase estándar HTTP en vez de depender del nombre de la clase de excepción (Nest y Passport no lo generaban igual).
- **Frontend con Signals** en vez de solo RxJS/Observables para el estado de UI (usuario actual, carrito, filtros): más simple de leer en los templates con Angular 19 y evita subscripciones manuales. RxJS se sigue usando donde tiene sentido (streams HTTP, debounce de búsqueda).
- **Carrito servidor-autoritativo con UI optimista:** el cliente refleja los cambios de inmediato (agregar/quitar) sin esperar la respuesta, pero el total final y los puntos del checkout siempre se recalculan en el servidor. Si una operación optimista falla, se hace rollback visual y se notifica el error.

## Reglas de puntos

Viven en `backend/src/rewards/points-rules.ts`, la única fuente de verdad. El cliente nunca envía ni decide cuántos puntos otorgar; solo dispara la acción y el servidor responde con el nuevo saldo.

| Acción | Puntos | Notas |
| --- | --- | --- |
| Agregar producto al carrito | +5 | Por cada llamada a la acción, independiente de la cantidad agregada. |
| Marcar como favorito | +2 | Idempotente: una sola vez por producto/usuario (constraint único en BD). Desmarcar no resta lo ya ganado. |
| Completar una compra (checkout) | +1 por cada $10.000 del total, mínimo 20 pts | Se calcula sobre el total recalculado en servidor, no sobre lo que mande el cliente. |

## Supuestos y recortes (por tiempo)

- **Sin verificación de email, recuperación de contraseña ni OAuth social.** El JWT no tiene refresh token (expira en 1h, configurable por `.env`).
- **URL del backend fija** en el frontend (`http://localhost:3000`) en vez de un build multi-entorno con `environment.ts` — se documenta aquí en vez de resolverlo con infraestructura que no aporta a lo evaluado.
- **Token en `localStorage`**, no en cookie `httpOnly`. Es más simple para una SPA sin backend de sesiones, pero es más expuesto a XSS que una cookie httpOnly + CSRF token; queda anotado como mejora futura.
- **El estado visual de "favorito" en las tarjetas de producto no persiste entre recargas de página.** El endpoint de listado no expone si el usuario ya marcó cada producto como favorito (requeriría un join adicional); el ícono solo refleja la respuesta del último toggle en la sesión actual del navegador.
- **No se persiste un historial de compras** (no hay entidad `Order`). El checkout descuenta stock y otorga puntos; la trazabilidad de "qué compra dio qué puntos" queda en el ledger `PointsTransaction`, que sí es suficiente para auditar el sistema de recompensas, que es lo que pide el enunciado.
- **Sin migraciones formales de base de datos** (`synchronize: true` en desarrollo). Aceptable para un take-home sin múltiples entornos; en producción se reemplazaría por migraciones versionadas de TypeORM.
- **Sin manejo de condiciones de carrera sobre el stock** entre el momento en que se valida y se descuenta dentro del checkout (ventana muy pequeña, mitigada por estar en una sola transacción, pero no hay locking explícito). Fuera de alcance para el tiempo disponible.
- **Sin tests automatizados** (unitarios ni e2e). Se priorizó verificar cada feature manualmente contra el backend real (incluida una pasada en navegador con Playwright para los flujos de auth, catálogo y carrito) antes de cada commit, en vez de invertir el tiempo en swetup de test runners.
- **Imágenes de producto desde `picsum.photos`** (placeholder), no assets propios — es data de seed, no forma parte de lo evaluado.

## Tiempo dedicado

Este ejercicio se construyó con asistencia de IA (Claude Code) en pair-programming, verificando cada feature contra el backend real y en navegador antes de cada commit. Si lo vas a presentar como entrega propia, es buena idea revisar el código, entender cada decisión listada arriba y ajustar lo que no compartas antes de enviarlo — sobre todo porque el enunciado pide poder defender las decisiones de arquitectura.
