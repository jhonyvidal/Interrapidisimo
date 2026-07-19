# Prueba Técnica — Desarrollador Senior Fullstack

Repositorio con las dos partes de la prueba, en carpetas independientes:

- **[ejercicio-1-catalogo-recompensas/](ejercicio-1-catalogo-recompensas/)** — Mini e-commerce (Angular + NestJS) con catálogo, carrito y sistema de puntos. Ver su [README](ejercicio-1-catalogo-recompensas/README.md) para instrucciones de ejecución, decisiones de arquitectura, reglas de puntos y supuestos.
- **[ejercicio-2-refactor-diagnostico/](ejercicio-2-refactor-diagnostico/)** — Diagnóstico y refactor de un componente con problemas de diseño/rendimiento. Ver [REFACTOR.md](ejercicio-2-refactor-diagnostico/REFACTOR.md) para el análisis priorizado.

## Cómo revisar

1. `ejercicio-1-catalogo-recompensas/backend` y `ejercicio-1-catalogo-recompensas/frontend` son proyectos independientes; cada uno con su propio `package.json`. Instrucciones de arranque en el README de esa carpeta.
2. `ejercicio-2-refactor-diagnostico/original/` tiene el snippet tal como se entregó, sin tocar; `refactored/` tiene la versión corregida. `REFACTOR.md` explica qué se priorizó y por qué.
3. La historia de commits está pensada para leerse de forma incremental: primero el backend (entidades → auth → endpoints → reglas de negocio → manejo de errores), después el frontend consumiéndolo feature por feature, y por último la documentación de cada ejercicio.

## Criterios de evaluación

Ver la tabla completa en el enunciado de la prueba. En resumen, este repo intenta dejar explícito en cada README/commit: por qué se tomó cada decisión de arquitectura, dónde vive la lógica de negocio (siempre en el backend, nunca confiando en el cliente), qué se dejó fuera por tiempo, y cómo se verificó cada feature antes de darla por terminada (contra el backend real y, para el frontend, en navegador).
