import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import fallbackProducts, {
  effectivePrice,
  type Product,
} from "@/data/products";

export type { Product };
export { effectivePrice };

export interface SiteSettings {
  brandName: string;
  tagline: string;
  heroText: string;
  aboutText: string;
  menuSubtitle: string;
  phone: string;
  email: string;
  location: string;
  hours: string;
  deliveryFee: number;
  promoBanner: string;
  promoCode: string;
  promoPercent: number;
  promoActive: boolean;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
  createdAtIso?: string;
}

interface CatalogContextType {
  products: Product[];
  settings: SiteSettings;
  loading: boolean;
  refreshCatalog: () => Promise<void>;
  createProduct: (product: Partial<Product>) => Promise<Product>;
  updateProduct: (id: number, product: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: number) => Promise<void>;
  updateSettings: (settings: Partial<SiteSettings>) => Promise<SiteSettings>;
  fetchMessages: () => Promise<ContactMessage[]>;
  markMessageRead: (id: number, read?: boolean) => Promise<void>;
  deleteMessage: (id: number) => Promise<void>;
}

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

const DEFAULT_SETTINGS: SiteSettings = {
  brandName: "Bite & Sips",
  tagline: "Sip rich, Bite right",
  heroText:
    "Enjoy delicious local breakfast meals prepared fresh every morning. Fast delivery, pickup, or dine-in options available.",
  aboutText:
    "Bite & Sips started as a small breakfast counter with one goal: fresh, honest food made fast.",
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

const CatalogContext = createContext<CatalogContextType | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const refreshCatalog = useCallback(async () => {
    try {
      setLoading(true);
      const [productsRes, settingsRes] = await Promise.all([
        fetch(`${API_BASE}/products`),
        fetch(`${API_BASE}/settings`),
      ]);

      if (productsRes.ok) {
        const data = (await productsRes.json()) as Product[];
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      }

      if (settingsRes.ok) {
        const data = (await settingsRes.json()) as SiteSettings;
        setSettings({ ...DEFAULT_SETTINGS, ...data });
      }
    } catch {
      // keep fallbacks
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshCatalog();
    const id = window.setInterval(() => void refreshCatalog(), 12_000);
    return () => window.clearInterval(id);
  }, [refreshCatalog]);

  const createProduct = async (product: Partial<Product>) => {
    const res = await fetch(`${API_BASE}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    if (!res.ok) throw new Error("Failed to create product");
    const saved = (await res.json()) as Product;
    setProducts((prev) => [...prev, saved]);
    return saved;
  };

  const updateProduct = async (id: number, product: Partial<Product>) => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    if (!res.ok) throw new Error("Failed to update product");
    const saved = (await res.json()) as Product;
    setProducts((prev) => prev.map((p) => (p.id === id ? saved : p)));
    return saved;
  };

  const deleteProduct = async (id: number) => {
    const res = await fetch(`${API_BASE}/products/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete product");
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const updateSettings = async (partial: Partial<SiteSettings>) => {
    const res = await fetch(`${API_BASE}/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...settings, ...partial }),
    });
    if (!res.ok) throw new Error("Failed to update settings");
    const saved = (await res.json()) as SiteSettings;
    setSettings({ ...DEFAULT_SETTINGS, ...saved });
    return saved;
  };

  const fetchMessages = async () => {
    const res = await fetch(`${API_BASE}/messages`);
    if (!res.ok) throw new Error("Failed to load messages");
    return (await res.json()) as ContactMessage[];
  };

  const markMessageRead = async (id: number, read = true) => {
    await fetch(`${API_BASE}/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read }),
    });
  };

  const deleteMessage = async (id: number) => {
    await fetch(`${API_BASE}/messages/${id}`, { method: "DELETE" });
  };

  const value = useMemo(
    () => ({
      products,
      settings,
      loading,
      refreshCatalog,
      createProduct,
      updateProduct,
      deleteProduct,
      updateSettings,
      fetchMessages,
      markMessageRead,
      deleteMessage,
    }),
    [products, settings, loading, refreshCatalog],
  );

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used inside CatalogProvider");
  return ctx;
}
