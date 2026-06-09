import "./Hero.css";
import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Sip rich, Bite right</h1>

        <p>
          Enjoy delicious local breakfast meals prepared fresh every morning.
          Fast delivery, pickup, or dine-in options available.
        </p>

        <div className="hero-buttons">
          <Link to="/cart">
          <button className="order-btn">
                Order Now
            </button>
          </Link>

          <a href="#menu">
          <button className="menu-btn">
                View Menu
          </button>
          </a>
        </div>
      </div>
    </section>
  );
}

export default Hero;