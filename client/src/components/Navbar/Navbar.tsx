import "./Navbar.css";
import { useCart } from "../../context/CartContext";
import { Link } from "react-router-dom";

function Navbar() {
  const { totalItems } = useCart();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        Bite &amp; Sips
      </Link>

      <ul className="navbar-links">
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <a href="/#menu">Menu</a>
        </li>
        <li>
          <a href="/#about">About</a>
        </li>
        <li>
          <a href="/#contact">Contact</a>
        </li>
      </ul>

      <div className="navbar-actions">
        <Link to="/tracking" className="nav-text-link">
          Track Order
        </Link>
        <Link to="/cart" className="cart-btn">
          Cart ({totalItems})
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
