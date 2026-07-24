import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Order } from "@/lib/orderHelpers";

export type { Order, OrderItem } from "@/lib/orderHelpers";

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  createOrder: (orderData: Partial<Order> & { items: Order["items"]; total: number }) => Promise<Order>;
  updateOrderStatus: (id: number, status: string) => Promise<void>;
  deleteOrder: (id: number) => Promise<void>;
  refreshOrders: () => Promise<void>;
}

interface OrderProviderProps {
  children: ReactNode;
}

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

export const OrderContext = createContext<OrderContextType | null>(null);

function readLocalOrders(): Order[] {
  try {
    const saved = localStorage.getItem("orders");
    return saved ? (JSON.parse(saved) as Order[]) : [];
  } catch {
    return [];
  }
}

function writeLocalOrders(orders: Order[]) {
  localStorage.setItem("orders", JSON.stringify(orders));
}

export function OrderProvider({ children }: OrderProviderProps) {
  const [orders, setOrders] = useState<Order[]>(() => readLocalOrders());
  const [loading, setLoading] = useState(false);
  const [useApi, setUseApi] = useState(true);

  const refreshOrders = useCallback(async () => {
    if (!useApi) {
      setOrders(readLocalOrders());
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/orders`);
      if (!res.ok) throw new Error("API unavailable");
      const data = (await res.json()) as Order[];
      setOrders(data);
      writeLocalOrders(data);
    } catch {
      setUseApi(false);
      setOrders(readLocalOrders());
    } finally {
      setLoading(false);
    }
  }, [useApi]);

  useEffect(() => {
    void refreshOrders();
  }, [refreshOrders]);

  useEffect(() => {
    if (!useApi) return;
    const id = window.setInterval(() => {
      void refreshOrders();
    }, 4000);
    return () => window.clearInterval(id);
  }, [useApi, refreshOrders]);

  useEffect(() => {
    if (!useApi) {
      writeLocalOrders(orders);
    }
  }, [orders, useApi]);

  const createOrder = async (
    orderData: Partial<Order> & { items: Order["items"]; total: number },
  ): Promise<Order> => {
    const nowIso = new Date().toISOString();
    const newOrder: Order = {
      id: orderData.id || Date.now(),
      customerName: orderData.customerName,
      phone: orderData.phone,
      address: orderData.address,
      notes: orderData.notes,
      fulfillment: orderData.fulfillment || "delivery",
      items: orderData.items,
      total: orderData.total,
      status: "Pending",
      createdAt: new Date().toLocaleString(),
      createdAtIso: nowIso,
      statusUpdatedAt: nowIso,
    };

    if (useApi) {
      try {
        const res = await fetch(`${API_BASE}/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newOrder),
        });
        if (!res.ok) throw new Error("Failed to create order");
        const saved = (await res.json()) as Order;
        setOrders((prev) => [...prev, saved]);
        return saved;
      } catch {
        setUseApi(false);
      }
    }

    setOrders((prev) => {
      const next = [...prev, newOrder];
      writeLocalOrders(next);
      return next;
    });
    return newOrder;
  };

  const updateOrderStatus = async (id: number, status: string) => {
    if (useApi) {
      try {
        const res = await fetch(`${API_BASE}/orders/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error("Failed to update order");
        const updated = (await res.json()) as Order;
        setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
        return;
      } catch {
        setUseApi(false);
      }
    }

    setOrders((prev) => {
      const next = prev.map((order) =>
        order.id === id
          ? { ...order, status, statusUpdatedAt: new Date().toISOString() }
          : order,
      );
      writeLocalOrders(next);
      return next;
    });
  };

  const deleteOrder = async (id: number) => {
    if (useApi) {
      try {
        const res = await fetch(`${API_BASE}/orders/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete order");
        setOrders((prev) => prev.filter((o) => o.id !== id));
        return;
      } catch {
        setUseApi(false);
      }
    }

    setOrders((prev) => {
      const next = prev.filter((order) => order.id !== id);
      writeLocalOrders(next);
      return next;
    });
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        createOrder,
        updateOrderStatus,
        deleteOrder,
        refreshOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrders must be used inside OrderProvider");
  }
  return context;
}
