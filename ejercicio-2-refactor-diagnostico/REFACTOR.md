# Ejercicio 2 — Refactor y diagnóstico

Análisis de [`original/ProductCatalog.jsx`](original/ProductCatalog.jsx). Versión corregida en [`refactored/ProductCatalog.jsx`](refactored/ProductCatalog.jsx).

## Problemas detectados, priorizados por impacto

### 1. Crítico — `fetch` disparado en cada render, sin `useEffect` ni cancelación

```jsx
fetch("https://api.tienda.com/products?category=" + props.category)
  .then((res) => res.json())
  .then((data) => { ... });
```

Esta llamada vive directamente en el cuerpo del componente, así que se ejecuta en **cada render**, no solo cuando cambia `category`. Cada respuesta hace `setProducts`, lo que dispara un nuevo render, que dispara un nuevo fetch: un loop de peticiones que satura la red y el backend. Tampoco hay cleanup, así que si el componente se desmonta o `category` cambia antes de que responda una petición vieja, esa respuesta igual llega y puede pisar datos más nuevos con datos viejos (race condition).

**Por qué es el problema #1:** es el único que puede tumbar el backend o dejar la UI mostrando datos incorrectos de forma silenciosa; los demás degradan la experiencia pero no generan tráfico descontrolado.

### 2. Crítico — el cliente calcula y envía los puntos

```jsx
setPoints(points + 10);
fetch(".../points", { method: "POST", body: JSON.stringify({ points: points + 10 }) });
```

El monto (`10`) y el cálculo (`points + 10`) están hardcodeados en el cliente, y encima se envían al servidor como si fueran la fuente de verdad. Cualquiera con las devtools abiertas puede interceptar esa petición y mandar `{ points: 999999 }`. Es exactamente el problema de negocio que ataca el ejercicio 1: **el servidor nunca debe confiar en un puntaje que le manda el cliente**, debe recibir solo la acción (`"agregué X al carrito"`) y decidir él cuántos puntos otorga.

**Por qué es crítico y no solo un bug:** los otros problemas de esta lista son de calidad de código; este es un hueco de seguridad/integridad de negocio explotable en producción.

### 3. Alto — mutación directa del estado del carrito

```jsx
cart.push(product);
setCart(cart);
```

`cart.push` muta el array en el lugar. React decide si re-renderiza comparando referencias, así que pasarle la *misma* referencia mutada a `setCart` puede hacer que React no detecte el cambio y la UI quede desincronizada del estado real (funciona "por accidente" en este componente simple, pero es un patrón que se rompe apenas el componente crece o se le agrega `React.memo` a un hijo).

### 4. Alto — la búsqueda destruye el catálogo original

```jsx
function handleSearch(e) {
  setSearch(e.target.value);
  var filtered = [...]; // filtra sobre `products`
  setProducts(filtered); // pisa `products` con el resultado filtrado
}
```

Cada tecleo en el buscador sobreescribe `products` con la lista filtrada. Si el usuario borra el texto de búsqueda, no hay forma de recuperar el catálogo completo porque ya no existe en memoria — habría que volver a pedirlo al backend. El buscador debería **derivar** una lista filtrada a partir del catálogo, no reemplazarlo.

### 5. Bajo — estilo y limpieza

- Falta `key` en el `.map` que renderiza los productos (React va a warnear en consola y puede reordenar mal el DOM si la lista cambia).
- `let cachedProducts = []` es una variable global de módulo que se escribe pero nunca se lee — código muerto.
- Uso de `var`, `indexOf(...) > -1` en vez de convenciones modernas (`let`/`const`, `.includes`).

Se corrigen como efecto colateral de tocar esas mismas líneas al resolver los puntos 1-4, pero por sí solos no rompen nada.

## Qué se refactorizó y por qué

Se atacaron los puntos **1 a 4**: los dos primeros porque comprometen correctitud/seguridad de forma directa (loop de red, integridad de puntos), y los otros dos porque aparecen en las mismas líneas que ya había que tocar para resolver 1 y 3, con costo marginal casi nulo una vez que el estado se está reestructurando de todas formas.

Cambios concretos en [`refactored/ProductCatalog.jsx`](refactored/ProductCatalog.jsx):

- El fetch se movió a un `useEffect` con dependencia en `category` y un `AbortController` que cancela la petición en curso si el componente se desmonta o la categoría cambia.
- `addToCart` ya no calcula puntos: llama a la acción (`ADD_TO_CART`) y actualiza `points` con el `pointsBalance` que devuelve el servidor.
- `setCart` usa la forma funcional (`setCart(prev => [...prev, product])`), sin mutar el array anterior.
- La búsqueda deriva `filteredProducts` con `useMemo` a partir de `products` y `search`, sin tocar `products`.
- Se agregó `key={p.id}`, se sacó `cachedProducts` (no se usaba), y se limpiaron `var`/`indexOf`.

## Qué queda para una segunda iteración (y por qué)

- **Estados de carga y error para el fetch** (spinner, mensaje de error, retry). El snippet original no los tenía y no es parte de los problemas señalados en el enunciado; agregarlos ahora habría sido expandir el alcance del diagnóstico en vez de corregir lo que estaba roto.
- **Manejo de fallo en la llamada de puntos:** si el `fetch` de `addToCart` falla después de que el producto ya se agregó al carrito, hoy no hay rollback ni reintento. Es un caso real, pero requiere decidir una política de UX (¿se deja el producto en el carrito igual? ¿se reintenta?) que no estaba definida en el snippet original — mejor dejarlo explícito como pendiente que improvisar una decisión de producto.
- **Evitar entradas duplicadas en el carrito** (hoy agregar el mismo producto dos veces crea dos filas en vez de incrementar cantidad). Es una decisión de UX/negocio, no un bug de programación; se deja para cuando se defina el modelo de carrito completo.
- **Dividir el componente** (`SearchBar`, `ProductList`, `ProductItem`) y tipar con TypeScript. Con ~70 líneas el componente todavía es legible de un vistazo; partirlo ahora sería una abstracción prematura sin un beneficio inmediato.
- **Debounce del input de búsqueda.** Con un catálogo chico el filtrado en cada tecleo es barato (es un `.filter` en memoria, no una llamada de red); vale la pena solo si el catálogo crece mucho.
- **Tests unitarios** del efecto de fetch y de la lógica del carrito — no se escribieron para mantener el foco en el diagnóstico y la corrección puntual, que es lo que pide el ejercicio.
