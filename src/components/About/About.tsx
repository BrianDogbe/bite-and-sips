import "./About.css";

function About() {
  return (
    <section className="about" id="about">
      <div className="about-content">
        <h2>About Bite &amp; Sips</h2>

        <p>
          Bite &amp; Sips started as a small cafeteria with one goal: fresh,
          honest food made fast. Every shawarma, sandwich, and salad on our menu
          is prepared to order.
        </p>

        <p>
          Whether you're grabbing a quick bite before work or ordering ahead for
          the family, we keep things simple — good food, fair prices, and no
          long waits.
        </p>

        <div className="about-stats">
          <div className="about-stat">
            <strong>100%</strong>
            <span>Fresh, made to order</span>
          </div>

          <div className="about-stat">
            <strong>20+</strong>
            <span>Menu items</span>
          </div>

          <div className="about-stat">
            <strong>7 days</strong>
            <span>A week</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
