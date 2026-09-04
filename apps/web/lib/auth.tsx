"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "./api";

type AuthUser = { id: string; role: string; phone: string };

type RegisterInput = {
  phone: string;
  password: string;
  role: "CLIENT" | "PROFESSIONAL";
  firstName: string;
  lastName: string;
  businessName?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<AuthUser>;
  register: (data: RegisterInput) => Promise<AuthUser>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "khedmati_session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { user: AuthUser; token: string };
        setUser(parsed.user);
        setToken(parsed.token);
      }
    } catch {
      // session corrompue -> on ignore, l'utilisateur se reconnectera
    } finally {
      setIsLoading(false);
    }
  }, []);

  const persist = (u: AuthUser, t: string) => {
    setUser(u);
    setToken(t);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: u, token: t }));
  };

  const login = async (phone: string, password: string) => {
    const res = await api.login(phone, password);
    persist(res.user, res.accessToken);
    return res.user;
  };

  const register = async (data: RegisterInput) => {
    const res = await api.register(data);
    persist(res.user, res.accessToken);
    return res.user;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit Ãªtre utilisÃ© Ã  l'intÃ©rieur de <AuthProvider>.");
  return ctx;
}

/**
 * ProtÃ¨ge une page/section : redirige vers /login si l'utilisateur n'est pas
 * connectÃ© avec l'un des rÃ´les autorisÃ©s. UtilisÃ© par les layouts
 * /mes-demandes, /artisan et /admin.
 */
export function useRequireRole(allowedRoles: string[]) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || !allowedRoles.includes(user.role))) {
      router.replace("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, user]);

  return { user, isLoading, isAuthorized: Boolean(user && allowedRoles.includes(user.role)) };
}

export { ApiError };

