"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api, ApiError } from "./api";

type AuthUser = { id: string; role: string; phone: string };

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<AuthUser>;
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

  const login = async (phone: string, password: string) => {
    const res = await api.login(phone, password);
    setUser(res.user);
    setToken(res.accessToken);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: res.user, token: res.accessToken }));
    return res.user;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit Ãªtre utilisÃ© Ã  l'intÃ©rieur de <AuthProvider>.");
  return ctx;
}

export { ApiError };
