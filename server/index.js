import cors from "cors";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");

const PORT = Number(process.env.PORT) || 3001;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "biteandsips2026";

const RESTAURANT = { lat: 5.6037, lng: -0.187 };

const ALLOWED_STATUSES = [
  "Pending",
  "Accepted",
  "Preparing",
  "Ready",
  "Out for delivery",
  "Delivered",
];

const DEFAULT_SETTINGS = {
  brandName: "Bite & Sips",
  tagline: "Sip rich, Bite right",
  heroText:
    "Enjoy delicious local breakfast meals prepared fresh every morning. Fast delivery, pickup, or dine-in options available.",
  aboutText:
    "Bite & Sips started as a small breakfast counter with one goal: fresh, honest food made fast. Every shawarma, sandwich, and salad on our menu is prepared to order.",
  menuSubtitle: "Fresh meals prepared with love",
  phone: "+233 20 000 0000",
  email: "hello@biteandsips.com",
  location: "Accra, Ghana",
  hours: "Every day, 7am – 8pm",
  deliveryFee: 5,
  promoBanner: "",
  promoCode: "",
  promoPercent: 0,
  promoActive: false,
};

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function ensureJson(file, fallback) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(fallback, null, 2), "utf8");
  }
}

ensureJson(ORDERS_FILE, []);
ensureJson(MESSAGES_FILE, []);
ensureJson(SETTINGS_FILE, DEFAULT_SETTINGS);
ensureJson(PRODUCTS_FILE, []);

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

function readOrders() {
  return readJson(ORDERS_FILE, []);
}
function writeOrders(orders) {
  writeJson(ORDERS_FILE, orders);
}
function readProducts() {
  return readJson(PRODUCTS_FILE, []);
}
function writeProducts(products) {
  writeJson(PRODUCTS_FILE, products);
}
function readMessages() {
  return readJson(MESSAGES_FILE, []);
}
function writeMessages(messages) {
  writeJson(MESSAGES_FILE, messages);
}
function readSettings() {
  return { ...DEFAULT_SETTINGS, ...readJson(SETTINGS_FILE, {}) };
}
function writeSettings(settings) {
  writeJson(SETTINGS_FILE, settings);
}

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function coordsFromAddress(address) {
  const seed = hashString(address || "accra");
  const latOffset = ((seed % 1000) / 1000 - 0.5) * 0.06;
  const lngOffset = (((seed / 1000) % 1000) / 1000 - 0.5) * 0.06;
  return {
    lat: RESTAURANT.lat + latOffset,
    lng: RESTAURANT.lng + lngOffset,
  };
}

function estimateTimes(items, fulfillment) {
  const itemCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const prepMinutes = Math.max(12, 8 + itemCount * 3);
  const deliveryMinutes =
    fulfillment === "delivery" ? 18 + Math.min(itemCount, 5) : 0;
  const now = Date.now();

  return {
    prepMinutes,
    deliveryMinutes,
    estimatedReadyAt: new Date(now + prepMinutes * 60_000).toISOString(),
    estimatedDeliveryAt: new Date(
      now + (prepMinutes + deliveryMinutes) * 60_000,
    ).toISOString(),
  };
}

function interpolate(a, b, t) {
  const p = Math.min(1, Math.max(0, t));
  return {
    lat: a.lat + (b.lat - a.lat) * p,
    lng: a.lng + (b.lng - a.lng) * p,
  };
}

function courierPosition(order) {
  const restaurant = order.restaurantCoords || RESTAURANT;
  const destination = order.deliveryCoords || restaurant;
  const status = order.status;

  if (
    status === "Pending" ||
    status === "Accepted" ||
    status === "Preparing" ||
    status === "Ready"
  ) {
    return { ...restaurant, phase: "at_kitchen" };
  }

  if (status === "Delivered" || order.fulfillment === "pickup") {
    return {
      ...(order.fulfillment === "pickup" ? restaurant : destination),
      phase: "arrived",
    };
  }

  const started = new Date(order.statusUpdatedAt || order.createdAtIso).getTime();
  const durationMs = Math.max(1, (order.deliveryMinutes || 20) * 60_000);
  const progress = (Date.now() - started) / durationMs;
  const point = interpolate(restaurant, destination, progress);

  return {
    ...point,
    phase: progress >= 1 ? "arriving" : "en_route",
    progress: Math.min(1, Math.max(0, progress)),
  };
}

function normalizeProduct(body, existing = {}) {
  const price = Number(body.price ?? existing.price ?? 0);
  const discountPercent = Math.min(
    100,
    Math.max(0, Number(body.discountPercent ?? existing.discountPercent ?? 0)),
  );

  return {
    id: existing.id || body.id || Date.now(),
    name: String(body.name ?? existing.name ?? "").trim(),
    category: String(body.category ?? existing.category ?? "other")
      .trim()
      .toLowerCase(),
    price,
    description: String(body.description ?? existing.description ?? "").trim(),
    image: String(body.image ?? existing.image ?? "/images/default-food.svg"),
    discountPercent,
    available:
      body.available !== undefined
        ? Boolean(body.available)
        : existing.available !== undefined
          ? Boolean(existing.available)
          : true,
  };
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "bite-and-sips" });
});

app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body ?? {};

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    return res.json({
      success: true,
      token: "admin-session",
      message: "Logged in",
    });
  }

  return res.status(401).json({ success: false, message: "Invalid credentials" });
});

/* -------- Settings -------- */
app.get("/api/settings", (_req, res) => {
  res.json(readSettings());
});

app.put("/api/settings", (req, res) => {
  const current = readSettings();
  const next = {
    ...current,
    ...req.body,
    deliveryFee: Number(req.body?.deliveryFee ?? current.deliveryFee) || 0,
    promoPercent: Math.min(
      100,
      Math.max(0, Number(req.body?.promoPercent ?? current.promoPercent) || 0),
    ),
    promoActive: Boolean(
      req.body?.promoActive !== undefined
        ? req.body.promoActive
        : current.promoActive,
    ),
  };
  writeSettings(next);
  res.json(next);
});

/* -------- Products / Menu -------- */
app.get("/api/products", (_req, res) => {
  res.json(readProducts());
});

app.post("/api/products", (req, res) => {
  const product = normalizeProduct(req.body ?? {});
  if (!product.name) {
    return res.status(400).json({ message: "Name is required" });
  }
  const products = readProducts();
  products.push(product);
  writeProducts(products);
  return res.status(201).json(product);
});

app.put("/api/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const products = readProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Product not found" });
  }
  const updated = normalizeProduct(req.body ?? {}, products[index]);
  updated.id = id;
  if (!updated.name) {
    return res.status(400).json({ message: "Name is required" });
  }
  products[index] = updated;
  writeProducts(products);
  return res.json(updated);
});

app.delete("/api/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const products = readProducts();
  const next = products.filter((p) => p.id !== id);
  if (next.length === products.length) {
    return res.status(404).json({ message: "Product not found" });
  }
  writeProducts(next);
  return res.status(204).send();
});

/* -------- Contact messages -------- */
app.get("/api/messages", (_req, res) => {
  const messages = readMessages().sort((a, b) => b.id - a.id);
  res.json(messages);
});

app.post("/api/messages", (req, res) => {
  const { name, email, message } = req.body ?? {};
  if (!name || !email || !message) {
    return res.status(400).json({ message: "Name, email, and message are required" });
  }
  const messages = readMessages();
  const entry = {
    id: Date.now(),
    name: String(name).trim(),
    email: String(email).trim(),
    message: String(message).trim(),
    read: false,
    createdAt: new Date().toLocaleString(),
    createdAtIso: new Date().toISOString(),
  };
  messages.push(entry);
  writeMessages(messages);
  return res.status(201).json(entry);
});

app.patch("/api/messages/:id", (req, res) => {
  const id = Number(req.params.id);
  const messages = readMessages();
  const index = messages.findIndex((m) => m.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Message not found" });
  }
  messages[index] = {
    ...messages[index],
    read:
      req.body?.read !== undefined
        ? Boolean(req.body.read)
        : messages[index].read,
  };
  writeMessages(messages);
  return res.json(messages[index]);
});

app.delete("/api/messages/:id", (req, res) => {
  const id = Number(req.params.id);
  const messages = readMessages();
  const next = messages.filter((m) => m.id !== id);
  if (next.length === messages.length) {
    return res.status(404).json({ message: "Message not found" });
  }
  writeMessages(next);
  return res.status(204).send();
});

/* -------- Orders -------- */
app.get("/api/orders", (_req, res) => {
  res.json(readOrders());
});

app.get("/api/orders/:id", (req, res) => {
  const id = Number(req.params.id);
  const order = readOrders().find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  return res.json(order);
});

app.get("/api/orders/:id/tracking", (req, res) => {
  const id = Number(req.params.id);
  const order = readOrders().find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  const courier = courierPosition(order);
  const now = Date.now();
  const etaTarget =
    order.fulfillment === "delivery"
      ? order.estimatedDeliveryAt
      : order.estimatedReadyAt;
  const etaMs = etaTarget ? new Date(etaTarget).getTime() - now : 0;

  return res.json({
    order,
    restaurant: order.restaurantCoords || RESTAURANT,
    destination: order.deliveryCoords || order.restaurantCoords || RESTAURANT,
    courier,
    etaMinutesRemaining: Math.max(0, Math.ceil(etaMs / 60_000)),
    etaAt: etaTarget,
  });
});

app.post("/api/orders", (req, res) => {
  const body = req.body ?? {};

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return res.status(400).json({ message: "Order must include items" });
  }

  if (!body.customerName || !body.phone) {
    return res.status(400).json({ message: "Name and phone are required" });
  }

  const fulfillment = body.fulfillment === "pickup" ? "pickup" : "delivery";
  const address =
    fulfillment === "delivery"
      ? String(body.address || "").trim()
      : "Pickup at Bite & Sips";

  if (fulfillment === "delivery" && !address) {
    return res.status(400).json({ message: "Delivery address is required" });
  }

  const times = estimateTimes(body.items, fulfillment);
  const nowIso = new Date().toISOString();
  const orders = readOrders();

  const order = {
    id: body.id || Date.now(),
    customerName: String(body.customerName).trim(),
    phone: String(body.phone).trim(),
    address,
    notes: body.notes ? String(body.notes).trim() : "",
    fulfillment,
    items: body.items,
    total: Number(body.total) || 0,
    promoCode: body.promoCode || "",
    promoDiscount: Number(body.promoDiscount) || 0,
    status: "Pending",
    createdAt: new Date().toLocaleString(),
    createdAtIso: nowIso,
    statusUpdatedAt: nowIso,
    restaurantCoords: RESTAURANT,
    deliveryCoords:
      fulfillment === "delivery" ? coordsFromAddress(address) : RESTAURANT,
    ...times,
  };

  orders.push(order);
  writeOrders(orders);
  return res.status(201).json(order);
});

app.patch("/api/orders/:id", (req, res) => {
  const id = Number(req.params.id);
  const orders = readOrders();
  const index = orders.findIndex((o) => o.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Order not found" });
  }

  const nextStatus = req.body?.status;
  if (!ALLOWED_STATUSES.includes(nextStatus)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const nowIso = new Date().toISOString();
  const current = orders[index];
  const updated = {
    ...current,
    status: nextStatus,
    statusUpdatedAt: nowIso,
  };

  if (nextStatus === "Out for delivery" && current.fulfillment === "delivery") {
    const mins = current.deliveryMinutes || 20;
    updated.estimatedDeliveryAt = new Date(
      Date.now() + mins * 60_000,
    ).toISOString();
  }

  if (nextStatus === "Ready") {
    updated.estimatedReadyAt = nowIso;
  }

  if (nextStatus === "Delivered") {
    updated.estimatedDeliveryAt = nowIso;
  }

  orders[index] = updated;
  writeOrders(orders);
  return res.json(orders[index]);
});

app.delete("/api/orders/:id", (req, res) => {
  const id = Number(req.params.id);
  const orders = readOrders();
  const next = orders.filter((o) => o.id !== id);

  if (next.length === orders.length) {
    return res.status(404).json({ message: "Order not found" });
  }

  writeOrders(next);
  return res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Bite & Sips API running on http://localhost:${PORT}`);
  console.log("Kitchen control panel: /kitchen (login at /kitchen/login)");
});
