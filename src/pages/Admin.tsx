import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { OrderContext } from "../context/OrderContext";
import { useAuth } from "../context/AuthContext";
import {
  effectivePrice,
  useCatalog,
  type ContactMessage,
  type Product,
  type SiteSettings,
} from "../context/CatalogContext";
import { formatEta, statusesForOrder } from "@/lib/orderHelpers";
import { playNewOrderSound } from "@/lib/notify";
import BrandLogo from "../components/BrandLogo";
import "./Admin.css";

type Tab = "overview" | "orders" | "menu" | "messages" | "site";

const emptyProduct: Partial<Product> = {
  name: "",
  category: "shawarma",
  price: 0,
  description: "",
  image: "/images/default-food.svg",
  discountPercent: 0,
  available: true,
};

function Admin() {
  const { orders, updateOrderStatus, deleteOrder, loading } =
    useContext(OrderContext)!;
  const {
    products,
    settings,
    createProduct,
    updateProduct,
    deleteProduct,
    updateSettings,
    fetchMessages,
    markMessageRead,
    deleteMessage,
    refreshCatalog,
  } = useCatalog();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>("overview");
  const [toast, setToast] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const knownIdsRef = useRef<Set<number> | null>(null);

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Product>>(emptyProduct);
  const [siteForm, setSiteForm] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSiteForm(settings);
  }, [settings]);

  useEffect(() => {
    if (knownIdsRef.current === null) {
      knownIdsRef.current = new Set(orders.map((o) => o.id));
      return;
    }
    const known = knownIdsRef.current;
    const newcomers = orders.filter((o) => !known.has(o.id));
    if (newcomers.length > 0) {
      newcomers.forEach((o) => known.add(o.id));
      const latest = newcomers[newcomers.length - 1];
      setToast(
        `New order #${latest.id} — ${latest.customerName || "Customer"} · GH₵ ${latest.total.toFixed(2)}`,
      );
      if (soundEnabled) playNewOrderSound();
      window.setTimeout(() => setToast(null), 6000);
    }
    knownIdsRef.current = new Set(orders.map((o) => o.id));
  }, [orders, soundEnabled]);

  useEffect(() => {
    if (tab !== "messages") return;
    void (async () => {
      try {
        setMessages(await fetchMessages());
      } catch {
        setMessages([]);
      }
    })();
    const id = window.setInterval(async () => {
      try {
        setMessages(await fetchMessages());
      } catch {
        /* ignore */
      }
    }, 8000);
    return () => window.clearInterval(id);
  }, [tab, fetchMessages]);

  const handleLogout = () => {
    logout();
    navigate("/kitchen/login", { replace: true });
  };

  const showToast = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(null), 4000);
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({ ...product });
    setTab("menu");
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyProduct);
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      alert("Item name is required");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateProduct(editingId, form);
        showToast("Menu item updated");
      } else {
        await createProduct(form);
        showToast("Menu item added");
      }
      resetForm();
      await refreshCatalog();
    } catch {
      alert("Could not save item. Is the API running?");
    } finally {
      setSaving(false);
    }
  };

  const removeProduct = async (id: number, name: string) => {
    if (!confirm(`Remove "${name}" from the public menu?`)) return;
    try {
      await deleteProduct(id);
      showToast("Item removed from menu");
      if (editingId === id) resetForm();
    } catch {
      alert("Could not delete item");
    }
  };

  const saveSite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(siteForm);
      showToast("Website settings saved — live on the customer site");
    } catch {
      alert("Could not save settings");
    } finally {
      setSaving(false);
    }
  };

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter((o) => o.status === "Pending").length;
  const unreadMessages = messages.filter((m) => !m.read).length;
  const discountedItems = products.filter(
    (p) => (p.discountPercent || 0) > 0,
  ).length;
  const sortedOrders = [...orders].sort((a, b) => b.id - a.id);

  return (
    <div className="kitchen-app">
      {toast && <div className="kitchen-toast">{toast}</div>}

      <aside className="kitchen-sidebar">
        <div className="kitchen-brand">
          <BrandLogo size={40} inverted />
          <p>Control Center</p>
        </div>

        <nav className="kitchen-nav">
          {(
            [
              ["overview", "Overview"],
              ["orders", "Live Orders"],
              ["menu", "Menu & Prices"],
              ["messages", "Messages"],
              ["site", "Website"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={tab === id ? "active" : ""}
              onClick={() => setTab(id)}
            >
              {label}
              {id === "messages" && unreadMessages > 0 && (
                <span className="nav-pill">{unreadMessages}</span>
              )}
              {id === "orders" && pendingOrders > 0 && (
                <span className="nav-pill">{pendingOrders}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="kitchen-sidebar-foot">
          <label className="sound-toggle">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
            />
            Order alert sound
          </label>
          <button type="button" className="ghost-btn" onClick={() => playNewOrderSound()}>
            Test sound
          </button>
          <button type="button" className="logout-btn" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>

      <main className="kitchen-main">
        {tab === "overview" && (
          <section>
            <header className="kitchen-page-head">
              <div>
                <p className="eyebrow">Dashboard</p>
                <h1>Welcome back</h1>
                <p className="muted">
                  Manage orders, menu, prices, discounts, and customer messages
                  in one place.
                </p>
              </div>
            </header>

            <div className="stats-grid">
              <div className="stat-card accent">
                <h3>Orders</h3>
                <p>{totalOrders}</p>
              </div>
              <div className="stat-card">
                <h3>Revenue</h3>
                <p>GH₵ {totalRevenue.toFixed(2)}</p>
              </div>
              <div className="stat-card warn">
                <h3>Pending</h3>
                <p>{pendingOrders}</p>
              </div>
              <div className="stat-card">
                <h3>Menu items</h3>
                <p>{products.length}</p>
              </div>
              <div className="stat-card">
                <h3>On discount</h3>
                <p>{discountedItems}</p>
              </div>
              <div className="stat-card">
                <h3>Unread msgs</h3>
                <p>{unreadMessages}</p>
              </div>
            </div>

            <div className="overview-panels">
              <div className="panel">
                <h3>Quick actions</h3>
                <div className="quick-actions">
                  <button type="button" onClick={() => setTab("orders")}>
                    Open live orders
                  </button>
                  <button type="button" onClick={() => { resetForm(); setTab("menu"); }}>
                    Add menu item
                  </button>
                  <button type="button" onClick={() => setTab("messages")}>
                    Read messages
                  </button>
                  <button type="button" onClick={() => setTab("site")}>
                    Edit website copy
                  </button>
                </div>
              </div>
              <div className="panel">
                <h3>Site promo</h3>
                <p>
                  {settings.promoActive
                    ? `Code ${settings.promoCode || "(none)"} — ${settings.promoPercent}% off`
                    : "No active promo code"}
                </p>
                <p className="muted small">
                  {settings.promoBanner || "No homepage banner set"}
                </p>
              </div>
            </div>
          </section>
        )}

        {tab === "orders" && (
          <section>
            <header className="kitchen-page-head">
              <div>
                <p className="eyebrow">Operations</p>
                <h1>Live Orders</h1>
              </div>
              {loading && <p className="muted">Refreshing…</p>}
            </header>

            {sortedOrders.length === 0 ? (
              <p className="empty-state">No orders yet. New ones alert with sound.</p>
            ) : (
              <div className="orders-grid">
                {sortedOrders.map((order) => {
                  const statusClass = order.status
                    .toLowerCase()
                    .replace(/\s+/g, "-");
                  return (
                    <div key={order.id} className="admin-order-card">
                      <h3>
                        {order.customerName}{" "}
                        <span className="order-id">#{order.id}</span>
                      </h3>
                      <p>Phone: {order.phone}</p>
                      <p>
                        {order.fulfillment === "pickup" ? "Pickup" : "Delivery"}
                        {order.address ? `: ${order.address}` : ""}
                      </p>
                      {order.notes ? <p>Notes: {order.notes}</p> : null}
                      <p>Ordered: {order.createdAt}</p>
                      <p>
                        ETA ready: {formatEta(order.estimatedReadyAt)}
                        {order.fulfillment === "delivery"
                          ? ` · Deliver by ${formatEta(order.estimatedDeliveryAt)}`
                          : ""}
                      </p>
                      <p>Total: GH₵ {order.total.toFixed(2)}</p>
                      <ul>
                        {order.items.map((item) => (
                          <li key={`${order.id}-${item.id}`}>
                            {item.name} × {item.quantity}
                          </li>
                        ))}
                      </ul>
                      <div className={`order-status ${statusClass}`}>
                        {order.status}
                      </div>
                      <div className="admin-buttons">
                        {statusesForOrder(order)
                          .filter((s) => s !== "Pending")
                          .map((status) => (
                            <button
                              key={status}
                              type="button"
                              className={
                                order.status === status ? "active-status" : ""
                              }
                              onClick={() =>
                                void updateOrderStatus(order.id, status)
                              }
                            >
                              {status}
                            </button>
                          ))}
                        <button
                          type="button"
                          className="danger"
                          onClick={() => void deleteOrder(order.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {tab === "menu" && (
          <section>
            <header className="kitchen-page-head">
              <div>
                <p className="eyebrow">Catalog</p>
                <h1>Menu, prices & discounts</h1>
                <p className="muted">
                  Changes appear on the customer website immediately.
                </p>
              </div>
            </header>

            <div className="menu-admin-grid">
              <form className="panel form-panel" onSubmit={saveProduct}>
                <h3>{editingId ? "Edit item" : "Add new item"}</h3>
                <label>Name</label>
                <input
                  value={form.name || ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Chicken Shawarma"
                  required
                />
                <label>Category</label>
                <input
                  value={form.category || ""}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  placeholder="shawarma, drinks…"
                  required
                />
                <label>Price (GH₵)</label>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={form.price ?? 0}
                  onChange={(e) =>
                    setForm({ ...form, price: Number(e.target.value) })
                  }
                  required
                />
                <label>Discount %</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.discountPercent ?? 0}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      discountPercent: Number(e.target.value),
                    })
                  }
                />
                <label>Description</label>
                <textarea
                  rows={3}
                  value={form.description || ""}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
                <label>Image URL</label>
                <input
                  value={form.image || ""}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="/images/item.jpg"
                />
                <label className="check-row">
                  <input
                    type="checkbox"
                    checked={form.available !== false}
                    onChange={(e) =>
                      setForm({ ...form, available: e.target.checked })
                    }
                  />
                  Available on menu
                </label>
                <div className="form-actions">
                  <button type="submit" disabled={saving}>
                    {saving ? "Saving…" : editingId ? "Save changes" : "Add item"}
                  </button>
                  {editingId && (
                    <button type="button" className="ghost-btn" onClick={resetForm}>
                      Cancel edit
                    </button>
                  )}
                </div>
              </form>

              <div className="menu-table-wrap">
                {products.map((product) => {
                  const sale = effectivePrice(product);
                  const hasDiscount = (product.discountPercent || 0) > 0;
                  return (
                    <div key={product.id} className="menu-row">
                      <img
                        src={product.image || "/images/default-food.svg"}
                        alt=""
                      />
                      <div className="menu-row-info">
                        <strong>{product.name}</strong>
                        <span className="muted">
                          {product.category}
                          {product.available === false ? " · hidden" : ""}
                        </span>
                        <div className="price-line">
                          {hasDiscount ? (
                            <>
                              <s>GH₵ {product.price}</s>{" "}
                              <strong>GH₵ {sale}</strong>
                              <span className="discount-tag">
                                -{product.discountPercent}%
                              </span>
                            </>
                          ) : (
                            <strong>GH₵ {product.price}</strong>
                          )}
                        </div>
                      </div>
                      <div className="menu-row-actions">
                        <button type="button" onClick={() => startEdit(product)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="danger"
                          onClick={() =>
                            void removeProduct(product.id, product.name)
                          }
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {tab === "messages" && (
          <section>
            <header className="kitchen-page-head">
              <div>
                <p className="eyebrow">Inbox</p>
                <h1>Customer messages</h1>
              </div>
              <button
                type="button"
                className="ghost-btn"
                onClick={() => void fetchMessages().then(setMessages)}
              >
                Refresh
              </button>
            </header>

            {messages.length === 0 ? (
              <p className="empty-state">
                No messages yet. Contact form submissions will show here.
              </p>
            ) : (
              <div className="messages-list">
                {messages.map((msg) => (
                  <article
                    key={msg.id}
                    className={`message-card ${msg.read ? "" : "unread"}`}
                  >
                    <div className="message-head">
                      <div>
                        <strong>{msg.name}</strong>
                        <a href={`mailto:${msg.email}`}>{msg.email}</a>
                      </div>
                      <span className="muted small">{msg.createdAt}</span>
                    </div>
                    <p>{msg.message}</p>
                    <div className="message-actions">
                      <button
                        type="button"
                        onClick={async () => {
                          await markMessageRead(msg.id, !msg.read);
                          setMessages(await fetchMessages());
                        }}
                      >
                        Mark {msg.read ? "unread" : "read"}
                      </button>
                      <button
                        type="button"
                        className="danger"
                        onClick={async () => {
                          await deleteMessage(msg.id);
                          setMessages(await fetchMessages());
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "site" && (
          <section>
            <header className="kitchen-page-head">
              <div>
                <p className="eyebrow">Brand & content</p>
                <h1>Website controls</h1>
                <p className="muted">
                  Update hero text, contact details, delivery fee, and promos.
                </p>
              </div>
            </header>

            <form className="panel site-form" onSubmit={saveSite}>
              <div className="site-grid">
                <div>
                  <label>Brand name</label>
                  <input
                    value={siteForm.brandName}
                    onChange={(e) =>
                      setSiteForm({ ...siteForm, brandName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label>Tagline</label>
                  <input
                    value={siteForm.tagline}
                    onChange={(e) =>
                      setSiteForm({ ...siteForm, tagline: e.target.value })
                    }
                  />
                </div>
                <div className="full">
                  <label>Hero paragraph</label>
                  <textarea
                    rows={3}
                    value={siteForm.heroText}
                    onChange={(e) =>
                      setSiteForm({ ...siteForm, heroText: e.target.value })
                    }
                  />
                </div>
                <div className="full">
                  <label>About text</label>
                  <textarea
                    rows={4}
                    value={siteForm.aboutText}
                    onChange={(e) =>
                      setSiteForm({ ...siteForm, aboutText: e.target.value })
                    }
                  />
                </div>
                <div className="full">
                  <label>Menu subtitle</label>
                  <input
                    value={siteForm.menuSubtitle}
                    onChange={(e) =>
                      setSiteForm({ ...siteForm, menuSubtitle: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label>Phone</label>
                  <input
                    value={siteForm.phone}
                    onChange={(e) =>
                      setSiteForm({ ...siteForm, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label>Email</label>
                  <input
                    value={siteForm.email}
                    onChange={(e) =>
                      setSiteForm({ ...siteForm, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label>Location</label>
                  <input
                    value={siteForm.location}
                    onChange={(e) =>
                      setSiteForm({ ...siteForm, location: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label>Hours</label>
                  <input
                    value={siteForm.hours}
                    onChange={(e) =>
                      setSiteForm({ ...siteForm, hours: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label>Delivery fee (GH₵)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={siteForm.deliveryFee}
                    onChange={(e) =>
                      setSiteForm({
                        ...siteForm,
                        deliveryFee: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="full">
                  <label>Homepage promo banner</label>
                  <input
                    value={siteForm.promoBanner}
                    onChange={(e) =>
                      setSiteForm({ ...siteForm, promoBanner: e.target.value })
                    }
                    placeholder="e.g. Weekend special — 10% off with code BITE10"
                  />
                </div>
                <div>
                  <label>Promo code</label>
                  <input
                    value={siteForm.promoCode}
                    onChange={(e) =>
                      setSiteForm({ ...siteForm, promoCode: e.target.value })
                    }
                    placeholder="BITE10"
                  />
                </div>
                <div>
                  <label>Promo % off</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={siteForm.promoPercent}
                    onChange={(e) =>
                      setSiteForm({
                        ...siteForm,
                        promoPercent: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="full">
                  <label className="check-row">
                    <input
                      type="checkbox"
                      checked={siteForm.promoActive}
                      onChange={(e) =>
                        setSiteForm({
                          ...siteForm,
                          promoActive: e.target.checked,
                        })
                      }
                    />
                    Promo code active at checkout
                  </label>
                </div>
              </div>
              <button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save website settings"}
              </button>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}

export default Admin;
