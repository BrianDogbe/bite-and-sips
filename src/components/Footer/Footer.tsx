import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="footer-logo">Bite &amp; Sips</div>
          <p>Fresh meals prepared with love, every single day.</p>
        </div>

        <div className="footer-links">
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <a href="/#menu">Menu</a>
          <a href="/#about">About</a>
          <a href="/#contact">Contact</a>
        </div>

        <div className="footer-links">
          <h4>Account</h4>
          <Link to="/cart">Cart</Link>
          <Link to="/tracking">Track Order</Link>
        </div>

        <div className="footer-contact">
          <h4>Contact</h4>
          <p>+233 24 469 3556</p>
          <p>hello@biteandsips.com</p>
          <p>Tema, Ghana</p>
        </div>
      </div>

      <div className="footer-bottom">
        &copy; {year} Bite &amp; Sips. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
