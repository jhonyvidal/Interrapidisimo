// ProductCatalog.jsx (refactorizado)
//
// Cambios respecto al original, en orden de prioridad (ver REFACTOR.md
// para el detalle de por que cada uno se considero critico/alto):
//   1. El fetch se dispara en un useEffect atado a `category`, con
//      AbortController para cancelar si el componente se desmonta o la
//      categoria cambia antes de que responda la peticion anterior.
//   2. El carrito se actualiza de forma inmutable (setState funcional).
//   3. Los puntos ya no los calcula ni los envia el cliente: se piden
//      via la accion y se toman de la respuesta del servidor.
//   4. La busqueda deriva una lista filtrada con useMemo en vez de
//      sobreescribir `products`, así el catalogo original nunca se pierde.

import React, { useEffect, useMemo, useState } from "react";

function ProductCatalog({ category }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`https://api.tienda.com/products?category=${category}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Error cargando productos", err);
        }
      });

    return () => controller.abort();
  }, [category]);

  const filteredProducts = useMemo(() => {
    if (!search) return products;
    const term = search.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(term));
  }, [products, search]);

  function handleSearch(e) {
    setSearch(e.target.value);
  }

  async function addToCart(product) {
    setCart((prevCart) => [...prevCart, product]);

    // El cliente solo dispara la accion; el servidor decide cuantos
    // puntos otorga y responde con el saldo actualizado.
    const res = await fetch("https://api.tienda.com/users/1/points", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ADD_TO_CART", productId: product.id }),
    });
    const { pointsBalance } = await res.json();
    setPoints(pointsBalance);
  }

  return (
    <div>
      <input value={search} onChange={handleSearch} />
      <p>Puntos: {points}</p>
      {filteredProducts.map((p) => (
        <div key={p.id} onClick={() => addToCart(p)}>
          <img src={p.image} alt={p.name} />
          <span>{p.name}</span>
          <span>${p.price}</span>
        </div>
      ))}
      <div>Items en carrito: {cart.length}</div>
    </div>
  );
}

export default ProductCatalog;
