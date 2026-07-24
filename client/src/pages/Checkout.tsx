import React, { useContext, useEffect, useMemo, useState } from "react";
import { useCart } from "../context/CartContext";
import { OrderContext } from "../context/OrderContext";
import { Link, useNavigate } from "react-router-dom";
import { previewEta } from "@/lib/orderHelpers";
import "./Checkout.css";

function Checkout() {
  const { cartItems, clearCart } = useCart();
  const { createOrder } = useContext(OrderContext)!;
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [fulfillment, setFulfillment] = useState<"delivery" | "pickup">(
    "delivery",
  );
  const [submitting, setSubmitting] = useState(false);

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const eta = useMemo(
    () => previewEta(itemCount, fulfillment),
    [itemCount, fulfillment],
  );

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const deliveryFee = fulfillment === "delivery" && subtotal > 0 ? 5 : 0;
  const total = subtotal + deliveryFee;

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/cart");
    }
  }, [cartItems.length, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) {
      alert("Please enter your name and phone number");
      return;
    }

    if (fulfillment === "delivery" && !address.trim()) {
      alert("Please enter a delivery address");
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty");
      navigate("/cart");
      return;
    }

    setSubmitting(true);

    try {
      const saved = await createOrder({
        id: Date.now(),
        customerName: name.trim(),
        phone: phone.trim(),
        address: fulfillment === "delivery" ? address.trim() : "Pickup",
        notes: notes.trim(),
        fulfillment,
        items: cartItems,
        total,
        status: "Pending",
        createdAt: new Date().toLocaleString(),
      });

      localStorage.setItem("lastOrderId", String(saved.id));
      clearCart();
      navigate("/success");
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="checkout-page">
      <h2 className="checkout-title">Checkout</h2>

      <div className="checkout-grid">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <select
            value={fulfillment}
            onChange={(e) =>
              setFulfillment(e.target.value as "delivery" | "pickup")
            }
          >
            <option value="delivery">Delivery (+GH₵ 5)</option>
            <option value="pickup">Pickup (free)</option>
          </select>

          {fulfillment === "delivery" && (
            <textarea
              placeholder="Delivery address (street, landmark, area)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              required
            />
          )}

          <textarea
            placeholder="Order notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />

          <div className="eta-preview">
            <strong>Estimated time</strong>
            <p>
              Prep ~{eta.prepMinutes} min
              {fulfillment === "delivery"
                ? ` + delivery ~${eta.deliveryMinutes} min`
                : ""}{" "}
              → <strong>~{eta.totalMinutes} min total</strong>
            </p>
          </div>

          <button
            type="submit"
            className="place-order-btn"
            disabled={submitting}
          >
            {submitting
              ? "Placing order…"
              : `Place Order — GH₵ ${total.toFixed(2)}`}
          </button>

          <Link to="/cart" style={{ textAlign: "center", marginTop: 8 }}>
            ← Back to cart
          </Link>
        </form>

        <div className="order-summary">
          <h3>Order Summary</h3>
          {cartItems.map((item) => (
            <div key={item.id} className="summary-item">
              <span>
                {item.name} × {item.quantity}
              </span>
              <strong>GH₵ {(item.price * item.quantity).toFixed(2)}</strong>
            </div>
          ))}
          <div className="summary-item">
            <span>Subtotal</span>
            <strong>GH₵ {subtotal.toFixed(2)}</strong>
          </div>
          <div className="summary-item">
            <span>Delivery</span>
            <strong>GH₵ {deliveryFee.toFixed(2)}</strong>
          </div>
          <div className="summary-item total">
            <span>Total</span>
            <strong>GH₵ {total.toFixed(2)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
