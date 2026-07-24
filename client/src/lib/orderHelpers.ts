export interface LatLng {
  lat: number;
  lng: number;
}

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: number;
  customerName?: string;
  phone?: string;
  address?: string;
  notes?: string;
  fulfillment?: "delivery" | "pickup";
  items: OrderItem[];
  total: number;
  status: string;
  createdAt?: string;
  createdAtIso?: string;
  statusUpdatedAt?: string;
  prepMinutes?: number;
  deliveryMinutes?: number;
  estimatedReadyAt?: string;
  estimatedDeliveryAt?: string;
  restaurantCoords?: LatLng;
  deliveryCoords?: LatLng;
}

export interface TrackingPayload {
  order: Order;
  restaurant: LatLng;
  destination: LatLng;
  courier: LatLng & { phase?: string; progress?: number };
  etaMinutesRemaining: number;
  etaAt?: string;
}

export const ORDER_STATUSES = [
  "Pending",
  "Accepted",
  "Preparing",
  "Ready",
  "Out for delivery",
  "Delivered",
] as const;

export function statusesForOrder(order: Order): string[] {
  if (order.fulfillment === "pickup") {
    return ["Pending", "Accepted", "Preparing", "Ready", "Delivered"];
  }
  return [...ORDER_STATUSES];
}

export function statusHeadline(order: Order): string {
  switch (order.status) {
    case "Pending":
      return "Waiting for the kitchen to confirm";
    case "Accepted":
      return "Order confirmed — kitchen is getting ready";
    case "Preparing":
      return "Your food is being prepared";
    case "Ready":
      return order.fulfillment === "pickup"
        ? "Ready for pickup"
        : "Ready — courier is on the way soon";
    case "Out for delivery":
      return "Courier is on the way to you";
    case "Delivered":
      return order.fulfillment === "pickup"
        ? "Picked up — enjoy your meal"
        : "Delivered — enjoy your meal";
    default:
      return order.status;
  }
}

export function formatEta(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function minutesUntil(iso?: string): number {
  if (!iso) return 0;
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 60_000));
}

/** Client-side ETA preview before placing an order */
export function previewEta(
  itemCount: number,
  fulfillment: "delivery" | "pickup",
) {
  const prepMinutes = Math.max(12, 8 + itemCount * 3);
  const deliveryMinutes =
    fulfillment === "delivery" ? 18 + Math.min(itemCount, 5) : 0;
  return { prepMinutes, deliveryMinutes, totalMinutes: prepMinutes + deliveryMinutes };
}
