import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { OrderContext } from "../context/OrderContext";
import { useNavigate } from "react-router-dom";

function Checkout() {
  const { cartItems, clearCart } = useContext(CartContext);
  const { createOrder } = useContext(OrderContext);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !phone) {
      alert("Please fill all fields");
      return;
    }

    const orderId = Date.now();

createOrder({
  id: orderId,
  customerName: name,
  phone,
  items: cartItems,
  total,
});

localStorage.setItem("lastOrderId", orderId);

    clearCart();

    navigate("/success");

    setName("");
    setPhone("");
  };

  return (
    <div className="checkout-page">
      <h2>Checkout</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <h3>Total: GH₵ {total}</h3>

        <button type="submit">
          Place Order
        </button>
      </form>
    </div>
  );
}

export default Checkout;