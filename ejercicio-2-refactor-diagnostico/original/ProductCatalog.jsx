// ProductCatalog.jsx
// Componente entregado por un desarrollador. Funciona, pero tiene problemas
// de diseño, rendimiento y mantenibilidad. Identifícalos, priorízalos y
// refactoriza los que consideres más críticos.

import React, { useState } from "react";

let cachedProducts = [];

function ProductCatalog(props) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [points, setPoints] = useState(0);

  // Se dispara en cada render
  fetch("https://api.tienda.com/products?category=" + props.category)
    .then((res) => res.json())
    .then((data) => {
      cachedProducts = data;
      setProducts(data);
    });

  function handleSearch(e) {
    setSearch(e.target.value);
    var filtered = [];
    for (var i = 0; i < products.length; i++) {
      if (products[i].name.indexOf(e.target.value) > -1) {
        filtered.push(products[i]);
      }
    }
    setProducts(filtered);
  }

  function addToCart(product) {
    cart.push(product);
    setCart(cart);
    // El cliente calcula y asigna los puntos
    setPoints(points + 10);
    fetch("https://api.tienda.com/users/1/points", {
      method: "POST",
      body: JSON.stringify({ points: points + 10 }),
    });
  }

  return (
    <div>
      <input value={search} onChange={handleSearch} />
      <p>Puntos: {points}</p>
      {products.map((p) => (
        <div onClick={() => addToCart(p)}>
          <img src={p.image} />
          <span>{p.name}</span>
          <span>${p.price}</span>
        </div>
      ))}
      <div>Items en carrito: {cart.length}</div>
    </div>
  );
}

export default ProductCatalog;
