import { redirect } from "@tanstack/react-router";

import { getToken } from "./api";

export function requireAuth() {
  if (typeof window !== "undefined" && !getToken()) {
    throw redirect({ to: "/login" });
  }
}

export function requireGuest() {
  if (typeof window !== "undefined" && getToken()) {
    throw redirect({ to: "/dashboard" });
  }
}
