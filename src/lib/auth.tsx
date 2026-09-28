import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { api, clearToken, getToken, setToken } from "./api";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

type AuthSession = {
  user: AuthUser;
  token: string;
};

type AuthContextValue = {
  user: AuthUser | undefined;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (name: string, email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const hasToken = !!token;

  useEffect(() => {
    setTokenState(getToken());
  }, []);

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: () => api<AuthUser>("/api/auth/me"),
    enabled: hasToken,
    retry: false,
  });

  const persistSession = async (session: AuthSession) => {
    setToken(session.token);
    setTokenState(session.token);
    queryClient.setQueryData(["me"], session.user);
    await queryClient.invalidateQueries();
    return session.user;
  };

  const value: AuthContextValue = {
    user: meQuery.data,
    isLoading: hasToken && meQuery.isLoading,
    login: async (email, password) => {
      const session = await api<AuthSession>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      return persistSession(session);
    },
    register: async (name, email, password) => {
      const session = await api<AuthSession>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      return persistSession(session);
    },
    logout: async () => {
      try {
        await api("/api/auth/logout", { method: "POST" });
      } catch {
        // Token is dropped locally either way.
      }
      clearToken();
      setTokenState(null);
      queryClient.clear();
      window.location.assign("/login");
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function useMe() {
  return useAuth().user;
}
