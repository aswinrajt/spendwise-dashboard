import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

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
  date: string; // yyyy-mm-dd
  description: string;
};

export type Budget = {
  id: string;
  categoryId: string;
  limit: number;
  month: string; // yyyy-mm
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

const uid = () => Math.random().toString(36).slice(2, 10);

const initialCategories: Category[] = [
  { id: "c1", name: "Groceries", icon: "ShoppingCart", color: "chart-1" },
  { id: "c2", name: "Dining Out", icon: "Utensils", color: "chart-2" },
  { id: "c3", name: "Housing", icon: "Home", color: "chart-3" },
  { id: "c4", name: "Transport", icon: "Car", color: "chart-4" },
  { id: "c5", name: "Health", icon: "HeartPulse", color: "chart-5" },
  { id: "c6", name: "Entertainment", icon: "Film", color: "chart-2" },
  { id: "c7", name: "Utilities", icon: "Wifi", color: "chart-3" },
  { id: "c8", name: "Salary", icon: "Briefcase", color: "chart-1" },
];

const MONTHS = [
  "2026-03",
  "2026-04",
  "2026-05",
  "2026-06",
  "2026-07",
  "2026-08",
];

export const CURRENT_MONTH = "2026-08";

function seedTransactions(): Transaction[] {
  const rows: Transaction[] = [];
  const expenseSeeds: Array<[string, string, number]> = [
    ["c1", "Weekly grocery run — Whole Foods", 128],
    ["c2", "Dinner with the team", 74],
    ["c3", "Apartment rent", 1650],
    ["c4", "Metro card top-up", 60],
    ["c5", "Pharmacy — prescriptions", 42],
    ["c6", "Streaming subscriptions", 38],
    ["c7", "Internet & electricity", 145],
    ["c1", "Farmers market produce", 56],
    ["c2", "Coffee & pastries", 23],
    ["c4", "Ride share to airport", 48],
  ];

  MONTHS.forEach((month, mi) => {
    rows.push({
      id: uid(),
      type: "income",
      amount: 5200 + mi * 60,
      categoryId: "c8",
      date: `${month}-01`,
      description: "Monthly salary",
    });
    if (mi % 2 === 0) {
      rows.push({
        id: uid(),
        type: "income",
        amount: 640 + mi * 40,
        categoryId: "c8",
        date: `${month}-14`,
        description: "Freelance design project",
      });
    }
    expenseSeeds.forEach(([categoryId, description, base], i) => {
      rows.push({
        id: uid(),
        type: "expense",
        amount: Math.round(base * (0.85 + ((mi * 7 + i * 3) % 40) / 100)),
        categoryId,
        date: `${month}-${String(2 + i * 2).padStart(2, "0")}`,
        description,
      });
    });
  });

  return rows.sort((a, b) => b.date.localeCompare(a.date));
}

const initialBudgets: Budget[] = [
  { id: "b1", categoryId: "c1", limit: 450, month: CURRENT_MONTH },
  { id: "b2", categoryId: "c2", limit: 250, month: CURRENT_MONTH },
  { id: "b3", categoryId: "c3", limit: 1800, month: CURRENT_MONTH },
  { id: "b4", categoryId: "c4", limit: 200, month: CURRENT_MONTH },
  { id: "b5", categoryId: "c6", limit: 120, month: CURRENT_MONTH },
  { id: "b6", categoryId: "c7", limit: 180, month: CURRENT_MONTH },
];

type Store = {
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  addTransaction: (t: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, t: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (c: Omit<Category, "id">) => void;
  updateCategory: (id: string, c: Omit<Category, "id">) => void;
  deleteCategory: (id: string) => void;
  saveBudget: (b: Omit<Budget, "id">, id?: string) => void;
  deleteBudget: (id: string) => void;
};

const FinanceContext = createContext<Store | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [transactions, setTransactions] = useState<Transaction[]>(seedTransactions);
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);

  const value = useMemo<Store>(
    () => ({
      categories,
      transactions,
      budgets,
      addTransaction: (t) =>
        setTransactions((prev) =>
          [{ ...t, id: uid() }, ...prev].sort((a, b) => b.date.localeCompare(a.date)),
        ),
      updateTransaction: (id, t) =>
        setTransactions((prev) =>
          prev
            .map((x) => (x.id === id ? { ...t, id } : x))
            .sort((a, b) => b.date.localeCompare(a.date)),
        ),
      deleteTransaction: (id) =>
        setTransactions((prev) => prev.filter((x) => x.id !== id)),
      addCategory: (c) => setCategories((prev) => [...prev, { ...c, id: uid() }]),
      updateCategory: (id, c) =>
        setCategories((prev) => prev.map((x) => (x.id === id ? { ...c, id } : x))),
      deleteCategory: (id) => {
        setCategories((prev) => prev.filter((x) => x.id !== id));
        setTransactions((prev) => prev.filter((x) => x.categoryId !== id));
        setBudgets((prev) => prev.filter((x) => x.categoryId !== id));
      },
      saveBudget: (b, id) =>
        setBudgets((prev) =>
          id
            ? prev.map((x) => (x.id === id ? { ...b, id } : x))
            : [...prev, { ...b, id: uid() }],
        ),
      deleteBudget: (id) => setBudgets((prev) => prev.filter((x) => x.id !== id)),
    }),
    [categories, transactions, budgets],
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

export const RECENT_MONTHS = MONTHS;
