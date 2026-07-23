import { useCart } from "../../context/CartContext";
import "./Cart.css";
import { Link } from "react-router-dom";

function Cart() {
  const { cartItems, increaseQty, decreaseQty, removeFromCart, clearCart } =
    useCart();

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <div className="cart-page">
      <h2 className="cart-title">Your Cart</h2>

      {cartItems.length === 0 ? (
        <div className="cart-empty">
          <h3>Your cart is empty</h3>
          <p>Add some delicious food from the menu</p>
          <Link to="/#menu" className="checkout-btn">
            Browse Menu
          </Link>
        </div>
      ) : (
        <>
          {/* CART ITEMS */}
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-info">
                  <h3>{item.name}</h3>
                  <p>GH₵ {item.price} each</p>
                </div>

                {/* QUANTITY CONTROLS */}
                <div className="cart-controls">
                  <button onClick={() => decreaseQty(item.id)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => increaseQty(item.id)}>+</button>
                </div>

                {/* TOTAL PER ITEM */}
                <div className="cart-total">
                  GH₵ {item.price * item.quantity}
                </div>

                {/* REMOVE */}
                <button
                  className="remove-btn"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* SUMMARY */}
          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>GH₵ {subtotal.toFixed(2)}</strong>
            </div>

            <div className="summary-row">
              <span>Delivery (at checkout)</span>
              <strong>from GH₵ 0.00</strong>
            </div>

            <div className="summary-row total">
              <span>Subtotal</span>
              <strong>GH₵ {subtotal.toFixed(2)}</strong>
            </div>

            <p className="cart-note">
              Choose delivery or pickup on the next step. Delivery is GH₵ 5.00.
            </p>

            <Link to="/checkout">
              <button className="checkout-btn">Proceed to Checkout</button>
            </Link>

            <button className="clear-btn" onClick={clearCart}>
              Clear Cart
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
