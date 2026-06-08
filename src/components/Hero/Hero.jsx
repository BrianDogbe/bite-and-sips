import "./Hero.css";

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
          <button className="order-btn">
            Order Now
          </button>

          <button className="menu-btn">
            View Menu
          </button>
        </div>
      </div>
    </section>
  );
}

export default Hero;