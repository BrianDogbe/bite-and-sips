import "./Hero.css";
import heroImage from "../../assets/hero.png";
import { useCatalog } from "@/context/CatalogContext";

function Hero() {
  const { settings } = useCatalog();

  return (
    <section
      className="hero"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${heroImage})`,
      }}
    >
      <div className="hero-content">
        <p className="hero-brand">{settings.brandName}</p>
        <h1>{settings.tagline}</h1>
        <p>{settings.heroText}</p>

        <div className="hero-buttons">
          <a href="#menu" className="order-btn">
            Order Now
          </a>
          <a href="#menu" className="menu-btn">
            View Menu
          </a>
        </div>
      </div>
    </section>
  );
}

export default Hero;
