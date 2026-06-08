import "./Navbar.css";
import { useContext } from "react";
import { CartContext } from "../../context/CartContext";
import { Link } from "react-router-dom";

function Navbar() {
  const { cartItems } = useContext(CartContext);

  return (
    <nav className="navbar">
      <div className="navbar-logo">Bite & Sips</div>

      <ul className="navbar-links">
        <li>Home</li>
        <li>Menu</li>
        <li>About</li>
        <li>Contact</li>
      </ul>

      <Link to="/cart">
        <button className="cart-btn">
          Cart ({cartItems.length})
        </button>
      </Link>
      <Link to="/admin">Admin</Link>
      <Link to="/tracking">Track Order</Link>
    </nav>
  );
}

export default Navbar;