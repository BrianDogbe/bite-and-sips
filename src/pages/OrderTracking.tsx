import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import LiveMap from "@/components/LiveMap/LiveMap";
import {
  formatEta,
  minutesUntil,
  statusHeadline,
  statusesForOrder,
  type Order,
  type TrackingPayload,
} from "@/lib/orderHelpers";
import "./OrderTracking.css";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

const RESTAURANT = { lat: 5.6037, lng: -0.187 };

function OrderTracking() {
  const [lookupId, setLookupId] = useState(
    () => localStorage.getItem("lastOrderId") ?? "",
  );
  const [activeId, setActiveId] = useState(() =>
    Number(localStorage.getItem("lastOrderId") || 0),
  );
  const [tracking, setTracking] = useState<TrackingPayload | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const tick = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    if (!activeId) {
      setOrder(null);
      setTracking(null);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/orders/${activeId}/tracking`);
        if (res.ok) {
          const data = (await res.json()) as TrackingPayload;
          if (!cancelled) {
            setTracking(data);
            setOrder(data.order);
            setError("");
          }
          return;
        }

        const fallback = await fetch(`${API_BASE}/orders/${activeId}`);
        if (fallback.ok) {
          const data = (await fallback.json()) as Order;
          if (!cancelled) {
            setOrder(data);
            setTracking(null);
            setError("");
          }
          return;
        }

        // localStorage fallback
        const saved = localStorage.getItem("orders");
        const list: Order[] = saved ? JSON.parse(saved) : [];
        const found = list.find((o) => o.id === activeId) || null;
        if (!cancelled) {
          setOrder(found);
          setTracking(null);
          setError(found ? "" : "No order found for that ID.");
        }
      } catch {
        const saved = localStorage.getItem("orders");
        const list: Order[] = saved ? JSON.parse(saved) : [];
        const found = list.find((o) => o.id === activeId) || null;
        if (!cancelled) {
          setOrder(found);
          setTracking(null);
          setError(found ? "" : "Could not reach the server. Try again.");
        }
      }
    };

    void load();
    const id = window.setInterval(() => void load(), 4000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [activeId, now]);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const id = Number(lookupId.trim());
    if (!id) return;
    setActiveId(id);
    localStorage.setItem("lastOrderId", String(id));
  };

  const steps = useMemo(() => (order ? statusesForOrder(order) : []), [order]);
  const currentIndex = order ? steps.indexOf(order.status) : -1;

  const etaIso =
    order?.fulfillment === "delivery"
      ? order.estimatedDeliveryAt
      : order?.estimatedReadyAt;
  const etaMins = minutesUntil(etaIso);

  const restaurant =
    tracking?.restaurant || order?.restaurantCoords || RESTAURANT;
  const destination =
    tracking?.destination || order?.deliveryCoords || restaurant;
  const courier = tracking?.courier || restaurant;

  const showMap =
    !!order && order.fulfillment === "delivery" && order.status !== "Pending";

  return (
    <div className="tracking-page">
      <h2>Track your order</h2>
      <p className="tracking-lead">
        Live status, estimated ready time, and courier location.
      </p>

      <form className="tracking-lookup" onSubmit={handleLookup}>
        <input
          type="text"
          placeholder="Enter Order ID"
          value={lookupId}
          onChange={(e) => setLookupId(e.target.value)}
        />
        <button type="submit">Track</button>
      </form>

      {error && <p className="tracking-error">{error}</p>}

      {!order && !error ? (
        <div className="tracking-empty">
          <p>Enter your Order ID to see live progress.</p>
          <Link to="/">Back to menu</Link>
        </div>
      ) : null}

      {order && (
        <div className="tracking-card">
          <div className="tracking-hero">
            <div>
              <p className="tracking-status-label">{order.status}</p>
              <h3>{statusHeadline(order)}</h3>
              <p className="tracking-meta">Order #{order.id}</p>
            </div>
            <div className="eta-bubble">
              {order.status === "Delivered" ? (
                <>
                  <span className="eta-number">Done</span>
                  <span className="eta-caption">Enjoy!</span>
                </>
              ) : (
                <>
                  <span className="eta-number">~{etaMins} min</span>
                  <span className="eta-caption">
                    {order.fulfillment === "delivery"
                      ? `Arrive by ${formatEta(etaIso)}`
                      : `Ready by ${formatEta(etaIso)}`}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="tracking-details">
            <p>
              <strong>{order.customerName}</strong> · {order.phone}
            </p>
            <p>
              {order.fulfillment === "pickup" ? "Pickup" : "Delivery"} —{" "}
              {order.address}
            </p>
            <p>Total: GH₵ {order.total.toFixed(2)}</p>
          </div>

          {showMap && (
            <div className="map-wrap">
              <LiveMap
                restaurant={restaurant}
                destination={destination}
                courier={courier}
                fulfillment={order.fulfillment}
                status={order.status}
              />
              <p className="map-caption">
                {order.status === "Out for delivery"
                  ? "Live courier position (updates as the order progresses)"
                  : order.status === "Delivered"
                    ? "Delivered to your location"
                    : "Kitchen location — courier starts when status is Out for delivery"}
              </p>
            </div>
          )}

          <div className="tracking-steps">
            {steps.map((status, index) => (
              <div
                key={status}
                className={`tracking-step ${
                  index <= currentIndex ? "completed" : ""
                }`}
              >
                <div className="step-circle">
                  {index <= currentIndex ? "✓" : ""}
                </div>
                <span>{status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderTracking;
