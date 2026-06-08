import { createContext, useState, useEffect } from "react";

export const OrderContext = createContext();

export function OrderProvider({ children }) { 
  const [orders, setOrders] = useState(() => {
  const savedOrders = localStorage.getItem("orders");
  


  return savedOrders
    ? JSON.parse(savedOrders)
    : [];
});

  const createOrder = (orderData) => {
    const newOrder = {
      id: Date.now(),
      ...orderData,
      status: "Pending",
      createdAt: new Date().toLocaleString(),
    };

    setOrders((prev) => [...prev, newOrder]);
  };

  const updateOrderStatus = (id, status) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id
          ? { ...order, status }
          : order
      )
    );
  };
  const deleteOrder = (id) => {
  setOrders((prev) =>
    prev.filter((order) => order.id !== id)
  );
};

  return (
    <OrderContext.Provider
      value={{
        orders,
        createOrder,
        updateOrderStatus,
        deleteOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}