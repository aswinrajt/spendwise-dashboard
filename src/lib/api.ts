const TOKEN_KEY = "spendwise_token";

const API_URL = import.meta.env.VITE_API_URL ?? "https://spendwise-backend-p2mf.onrender.com";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });

  if (res.status === 204) return undefined as T;

  const json = (await res.json().catch(() => ({}))) as {
    data?: T;
    error?: string;
  };

  if (res.status === 401) {
    clearToken();
    if (typeof window !== "undefined") {
      const pathName = window.location.pathname;
      if (pathName !== "/login" && pathName !== "/register") {
        window.location.assign("/login");
      }
    }
  }

  if (!res.ok) {
    throw new ApiError(res.status, json.error ?? "Request failed");
  }

  return json.data as T;
}
