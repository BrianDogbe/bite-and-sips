import { useContext, useState } from "react";
import products from "../../data/products";
import { CartContext } from "../../context/CartContext";
import "./Menu.css";

function Menu() {
  const { addToCart } = useContext(CartContext);
  const [activeCategory, setActiveCategory] = useState("all");

  // extract unique categories
  const categories = ["all", ...new Set(products.map((p) => p.category))];

  // filter products
  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <div className="menu-page">
      <h2 className="menu-title">Our Menu</h2>

      {/* CATEGORY FILTER */}
      <div className="menu-filters">
        {categories.map((cat) => (
          <button
            key={cat}
            className={activeCategory === cat ? "active" : ""}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* MENU GRID */}
      <div className="menu-grid">
        {filteredProducts.map((item) => (
          <div key={item.id} className="menu-card">
            <h3>{item.name}</h3>
            <p>{item.description}</p>

            <div className="menu-card-footer">
              <span className="price">GH₵ {item.price}</span>

              <button onClick={() => addToCart(item)}>
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Menu;