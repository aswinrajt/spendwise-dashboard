import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  Scale,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AppShell } from "@/components/app-shell";
import { CategoryIcon } from "@/components/category-icon";
import { TransactionDialog } from "@/components/transaction-dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CURRENT_MONTH,
  RECENT_MONTHS,
  currency,
  currencyPrecise,
  dateLabel,
  monthLabel,
  useFinance,
} from "@/lib/finance-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SpendWise Dashboard — Income, Expenses & Budgets" },
      {
        name: "description",
        content:
          "Track income, expenses, balance and monthly budgets at a glance with the SpendWise personal finance dashboard.",
      },
      { property: "og:title", content: "SpendWise Dashboard — Personal Finance" },
      {
        property: "og:description",
        content:
          "See monthly income vs expenses, category spending and budget progress in one clean dashboard.",
      },
    ],
  }),
  component: Dashboard,
});

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof TrendingUp;
  tone: "income" | "expense" | "primary" | "warning";
}) {
  const toneStyles = {
    income: "bg-income-soft text-income",
    expense: "bg-expense-soft text-expense",
    primary: "bg-accent text-accent-foreground",
    warning: "bg-muted text-warning",
  }[tone];

  return (
    <div className="stat-card p-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-2xl font-extrabold tracking-tight lg:text-3xl">
            {value}
          </p>
        </div>
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${toneStyles}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function Dashboard() {
  const { transactions, categories, budgets } = useFinance();
  const [addOpen, setAddOpen] = useState(false);

  const catById = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c])),
    [categories],
  );

  const monthTx = transactions.filter((t) => t.date.startsWith(CURRENT_MONTH));
  const income = monthTx
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const expenses = monthTx
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const monthlyBudget = budgets.reduce((s, b) => s + b.limit, 0);

  const trend = RECENT_MONTHS.map((m) => {
    const rows = transactions.filter((t) => t.date.startsWith(m));
    return {
      month: monthLabel(m).split(" ")[0],
      Income: rows.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
      Expenses: rows.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    };
  });

  const byCategory = categories
    .map((c) => ({
      name: c.name,
      color: c.color,
      value: monthTx
        .filter((t) => t.type === "expense" && t.categoryId === c.id)
        .reduce((s, t) => s + t.amount, 0),
    }))
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value);

  const budgetCards = budgets.map((b) => {
    const spent = monthTx
      .filter((t) => t.type === "expense" && t.categoryId === b.categoryId)
      .reduce((s, t) => s + t.amount, 0);
    return { ...b, spent, pct: Math.min(100, Math.round((spent / b.limit) * 100)) };
  });

  return (
    <AppShell
      title="Dashboard"
      subtitle={`Overview for ${monthLabel(CURRENT_MONTH)}`}
      actions={
        <Button className="rounded-xl" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Add</span>
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total income"
          value={currency(income)}
          hint="Salary and freelance work this month"
          icon={TrendingUp}
          tone="income"
        />
        <StatCard
          label="Total expenses"
          value={currency(expenses)}
          hint={`${monthTx.filter((t) => t.type === "expense").length} expense entries`}
          icon={TrendingDown}
          tone="expense"
        />
        <StatCard
          label="Current balance"
          value={currency(income - expenses)}
          hint="Income minus expenses"
          icon={Scale}
          tone="primary"
        />
        <StatCard
          label="Monthly budget"
          value={currency(monthlyBudget)}
          hint={`${currency(Math.max(0, monthlyBudget - expenses))} still available`}
          icon={Target}
          tone="warning"
        />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <section className="stat-card p-5 xl:col-span-2">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <h2 className="text-base font-bold">Income vs expenses</h2>
              <p className="text-sm text-muted-foreground">Last six months</p>
            </div>
          </div>
          <div className="mt-5 h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend} barGap={6}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={52}
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`}
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)" }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    color: "var(--card-foreground)",
                  }}
                  formatter={(v: number) => currency(v)}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Income" fill="var(--income)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Expenses" fill="var(--expense)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="stat-card p-5">
          <h2 className="text-base font-bold">Spending by category</h2>
          <p className="text-sm text-muted-foreground">{monthLabel(CURRENT_MONTH)}</p>
          <div className="mt-3 h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byCategory}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                  isAnimationActive={false}
                  stroke="var(--card)"
                >
                  {byCategory.map((c) => (
                    <Cell key={c.name} fill={`var(--${c.color})`} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    color: "var(--card-foreground)",
                  }}
                  formatter={(v: number) => currency(v)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-2">
            {byCategory.slice(0, 5).map((c) => (
              <li key={c.name} className="flex items-center gap-2 text-sm">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: `var(--${c.color})` }}
                />
                <span className="min-w-0 flex-1 truncate text-muted-foreground">{c.name}</span>
                <span className="shrink-0 font-semibold">{currency(c.value)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <section className="stat-card p-5 xl:col-span-2">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <h2 className="min-w-0 truncate text-base font-bold">Recent transactions</h2>
            <Button asChild variant="ghost" size="sm" className="shrink-0">
              <Link to="/transactions">View all</Link>
            </Button>
          </div>
          <ul className="mt-3 divide-y divide-border">
            {transactions.slice(0, 7).map((t) => {
              const cat = catById[t.categoryId];
              return (
                <li key={t.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-3">
                  <CategoryIcon icon={cat?.icon ?? "Circle"} color={cat?.color ?? "chart-1"} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{t.description}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {cat?.name ?? "Uncategorized"} · {dateLabel(t.date)}
                    </p>
                  </div>
                  <span
                    className={`flex shrink-0 items-center gap-1 text-sm font-semibold ${
                      t.type === "income" ? "text-income" : "text-expense"
                    }`}
                  >
                    {t.type === "income" ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    {currencyPrecise(t.amount)}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="stat-card p-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <h2 className="min-w-0 truncate text-base font-bold">Budget progress</h2>
            <Button asChild variant="ghost" size="sm" className="shrink-0">
              <Link to="/budgets">Manage</Link>
            </Button>
          </div>
          <div className="mt-4 space-y-4">
            {budgetCards.slice(0, 5).map((b) => {
              const cat = catById[b.categoryId];
              const over = b.spent > b.limit;
              return (
                <div key={b.id}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate font-medium">{cat?.name}</span>
                    <span
                      className={`shrink-0 text-xs font-semibold ${
                        over ? "text-expense" : "text-muted-foreground"
                      }`}
                    >
                      {currency(b.spent)} / {currency(b.limit)}
                    </span>
                  </div>
                  <Progress value={b.pct} className="mt-2 h-2" />
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <TransactionDialog open={addOpen} onOpenChange={setAddOpen} />
    </AppShell>
  );
}
