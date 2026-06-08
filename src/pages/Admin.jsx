import { useContext } from "react";
import { OrderContext } from "../context/OrderContext";

function Admin() {
  const {
    orders,
    updateOrderStatus,
    deleteOrder,
  } = useContext(OrderContext);

  return (
    <div className="admin-page">
      <h2>Admin Dashboard</h2>

      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            className="admin-order-card"
          >
            <h3>{order.customerName}</h3>

            <p>Phone: {order.phone}</p>

            <p>Total: GH₵ {order.total}</p>

            <p>Status: {order.status}</p>

            <button
              onClick={() =>
                updateOrderStatus(
                  order.id,
                  "Accepted"
                )
              }
            >
              Accept
            </button>

            <button
              onClick={() =>
                updateOrderStatus(
                  order.id,
                  "Preparing"
                )
              }
            >
              Preparing
            </button>

            <button
              onClick={() =>
                updateOrderStatus(
                  order.id,
                  "Ready"
                )
              }
            >
              Ready
            </button>

            <button
              onClick={() =>
                updateOrderStatus(
                  order.id,
                  "Delivered"
                )
              }
            >
              Delivered
            </button>

            <button
              onClick={() =>
                deleteOrder(order.id)
              }
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default Admin;