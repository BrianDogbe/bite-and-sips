import { useState } from "react";
import { effectivePrice, useCatalog, type Product } from "@/context/CatalogContext";
import { useCart } from "@/context/CartContext";
import "./Menu.css";

function Menu() {
  const { products, settings } = useCatalog();
  const { addToCart } = useCart();
  const [activeCategory, setActiveCategory] = useState("all");

  const visible = products.filter((p) => p.available !== false);

  const categories = [
    "all",
    ...Array.from(new Set(visible.map((p) => p.category))),
  ];

  const filteredProducts =
    activeCategory === "all"
      ? visible
      : visible.filter((product) => product.category === activeCategory);

  const handleAdd = (item: Product) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: effectivePrice(item),
      image: item.image,
    });
  };

  return (
    <section className="menu" id="menu">
      {settings.promoBanner ? (
        <div className="menu-promo-banner">{settings.promoBanner}</div>
      ) : null}

      <div className="menu-header">
        <h1>Our Menu</h1>
        <p>{settings.menuSubtitle}</p>
      </div>

      <div className="categories">
        {categories.map((category) => (
          <button
            key={category}
            className={activeCategory === category ? "active-category" : ""}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="product-grid">
        {filteredProducts.map((item) => {
          const sale = effectivePrice(item);
          const discounted = (item.discountPercent || 0) > 0;
          return (
            <div className="product-card" key={item.id}>
              <div className="image-container">
                <img
                  src={item.image ?? "/images/default-food.svg"}
                  alt={item.name}
                />
                {discounted && (
                  <span className="sale-badge">-{item.discountPercent}%</span>
                )}
              </div>

              <div className="product-info">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <div className="price">
                  {discounted ? (
                    <>
                      <s>GH₵ {item.price}</s> GH₵ {sale}
                    </>
                  ) : (
                    <>GH₵ {item.price}</>
                  )}
                </div>
                <button onClick={() => handleAdd(item)}>Add To Cart</button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Menu;
