import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useMemo, type ReactNode } from "react";

import { api, getToken } from "./api";

export type TxType = "income" | "expense";

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export type Transaction = {
  id: string;
  type: TxType;
  amount: number;
  categoryId: string;
  date: string;
  description: string;
};

export type Budget = {
  id: string;
  categoryId: string;
  limit: number;
  month: string;
};

export const CATEGORY_ICONS = [
  "ShoppingCart",
  "Utensils",
  "Home",
  "Car",
  "HeartPulse",
  "Plane",
  "Film",
  "GraduationCap",
  "Wifi",
  "Dumbbell",
  "Gift",
  "Briefcase",
] as const;

export const CATEGORY_COLORS = [
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
] as const;

export const CURRENT_MONTH = "2026-08";

export const RECENT_MONTHS = [
  "2026-03",
  "2026-04",
  "2026-05",
  "2026-06",
  "2026-07",
  "2026-08",
];

type Store = {
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  addTransaction: (t: Omit<Transaction, "id">) => Promise<void>;
  updateTransaction: (id: string, t: Omit<Transaction, "id">) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addCategory: (c: Omit<Category, "id">) => Promise<void>;
  updateCategory: (id: string, c: Omit<Category, "id">) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  saveBudget: (b: Omit<Budget, "id">, id?: string) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
};

const FinanceContext = createContext<Store | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const enabled = !!getToken();

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => api<Category[]>("/api/categories"),
    enabled,
  });
  const transactionsQuery = useQuery({
    queryKey: ["transactions"],
    queryFn: () => api<Transaction[]>("/api/transactions"),
    enabled,
  });
  const budgetsQuery = useQuery({
    queryKey: ["budgets"],
    queryFn: () => api<Budget[]>("/api/budgets"),
    enabled,
  });

  const addTransaction = useMutation({
    mutationFn: (t: Omit<Transaction, "id">) =>
      api<Transaction>("/api/transactions", {
        method: "POST",
        body: JSON.stringify(t),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transactions"] }),
  });
  const updateTransaction = useMutation({
    mutationFn: ({ id, t }: { id: string; t: Omit<Transaction, "id"> }) =>
      api<Transaction>(`/api/transactions/${id}`, {
        method: "PATCH",
        body: JSON.stringify(t),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transactions"] }),
  });
  const deleteTransaction = useMutation({
    mutationFn: (id: string) =>
      api<void>(`/api/transactions/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transactions"] }),
  });

  const addCategory = useMutation({
    mutationFn: (c: Omit<Category, "id">) =>
      api<Category>("/api/categories", {
        method: "POST",
        body: JSON.stringify(c),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
  const updateCategory = useMutation({
    mutationFn: ({ id, c }: { id: string; c: Omit<Category, "id"> }) =>
      api<Category>(`/api/categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify(c),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
  const deleteCategory = useMutation({
    mutationFn: (id: string) =>
      api<void>(`/api/categories/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["categories"] });
      void queryClient.invalidateQueries({ queryKey: ["transactions"] });
      void queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });

  const saveBudget = useMutation({
    mutationFn: ({ b, id }: { b: Omit<Budget, "id">; id?: string }) =>
      id
        ? api<Budget>(`/api/budgets/${id}`, {
            method: "PATCH",
            body: JSON.stringify(b),
          })
        : api<Budget>("/api/budgets", {
            method: "POST",
            body: JSON.stringify(b),
          }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budgets"] }),
  });
  const deleteBudget = useMutation({
    mutationFn: (id: string) => api<void>(`/api/budgets/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budgets"] }),
  });

  const value = useMemo<Store>(
    () => ({
      categories: categoriesQuery.data ?? [],
      transactions: transactionsQuery.data ?? [],
      budgets: budgetsQuery.data ?? [],
      addTransaction: (t) => addTransaction.mutateAsync(t).then(() => undefined),
      updateTransaction: (id, t) =>
        updateTransaction.mutateAsync({ id, t }).then(() => undefined),
      deleteTransaction: (id) =>
        deleteTransaction.mutateAsync(id).then(() => undefined),
      addCategory: (c) => addCategory.mutateAsync(c).then(() => undefined),
      updateCategory: (id, c) =>
        updateCategory.mutateAsync({ id, c }).then(() => undefined),
      deleteCategory: (id) => deleteCategory.mutateAsync(id).then(() => undefined),
      saveBudget: (b, id) => saveBudget.mutateAsync({ b, id }).then(() => undefined),
      deleteBudget: (id) => deleteBudget.mutateAsync(id).then(() => undefined),
    }),
    [
      categoriesQuery.data,
      transactionsQuery.data,
      budgetsQuery.data,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addCategory,
      updateCategory,
      deleteCategory,
      saveBudget,
      deleteBudget,
    ],
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used inside FinanceProvider");
  return ctx;
}

export const currency = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

export const currencyPrecise = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export const monthLabel = (m: string) =>
  new Date(`${m}-01T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

export const dateLabel = (d: string) =>
  new Date(`${d}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
