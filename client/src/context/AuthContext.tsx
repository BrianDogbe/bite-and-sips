import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

// Demo fallback when the API is offline. Change before any public deploy.
const FALLBACK_USERNAME = "admin";
const FALLBACK_PASSWORD = "biteandsips2026";

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("isAdminAuthenticated") === "true";
  });

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        localStorage.setItem("isAdminAuthenticated", "true");
        setIsAuthenticated(true);
        return true;
      }
    } catch {
      // fall through to offline demo credentials
    }

    const success =
      username === FALLBACK_USERNAME && password === FALLBACK_PASSWORD;

    if (success) {
      localStorage.setItem("isAdminAuthenticated", "true");
      setIsAuthenticated(true);
    }

    return success;
  };

  const logout = () => {
    localStorage.removeItem("isAdminAuthenticated");
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
