import { Link } from "react-router-dom";

function OrderSuccess() {
  const orderId = localStorage.getItem("lastOrderId");

  return (
    <div
      style={{
        padding: "50px 20px",
        textAlign: "center",
        maxWidth: 560,
        margin: "0 auto",
      }}
    >
      <h1>Order placed</h1>

      {orderId ? (
        <p>
          Order ID: <strong>{orderId}</strong>
        </p>
      ) : (
        <p>No recent order found.</p>
      )}

      <p>
        The kitchen has been notified. You can track prep time and live courier
        location on the tracking page.
      </p>

      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "center",
          marginTop: 20,
          flexWrap: "wrap",
        }}
      >
        <Link to="/tracking">
          <button style={{ padding: "10px 20px" }}>Track live</button>
        </Link>
        <Link to="/">
          <button style={{ padding: "10px 20px" }}>Back to menu</button>
        </Link>
      </div>
    </div>
  );
}

export default OrderSuccess;
