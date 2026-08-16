import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { CategoryIcon } from "@/components/category-icon";
import { BudgetDialog } from "@/components/budget-dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CURRENT_MONTH,
  currency,
  monthLabel,
  useFinance,
  type Budget,
} from "@/lib/finance-store";

export const Route = createFileRoute("/budgets")({
  head: () => ({
    meta: [
      { title: "Monthly Budgets — SpendWise" },
      {
        name: "description",
        content:
          "Set monthly category budgets, watch spending progress and see exactly how much is left to spend.",
      },
      { property: "og:title", content: "Monthly Budgets — SpendWise" },
      {
        property: "og:description",
        content: "Category budgets with live progress bars and remaining amounts.",
      },
    ],
  }),
  component: BudgetsPage,
});

function BudgetsPage() {
  const { budgets, categories, transactions, deleteBudget } = useFinance();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Budget | null>(null);

  const catById = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c])),
    [categories],
  );

  const monthTx = transactions.filter(
    (t) => t.date.startsWith(CURRENT_MONTH) && t.type === "expense",
  );

  const cards = budgets.map((b) => {
    const spent = monthTx
      .filter((t) => t.categoryId === b.categoryId)
      .reduce((s, t) => s + t.amount, 0);
    const pct = Math.round((spent / b.limit) * 100);
    return { ...b, spent, pct };
  });

  const totalLimit = cards.reduce((s, c) => s + c.limit, 0);
  const totalSpent = cards.reduce((s, c) => s + c.spent, 0);

  return (
    <AppShell
      title="Budgets"
      subtitle={`Spending plan for ${monthLabel(CURRENT_MONTH)}`}
      actions={
        <Button
          className="rounded-xl"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Budget</span>
        </Button>
      }
    >
      <div className="stat-card p-5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">Total budgeted this month</p>
            <p className="mt-1 font-display text-3xl font-extrabold">
              {currency(totalLimit)}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm text-muted-foreground">Remaining</p>
            <p className="mt-1 font-display text-2xl font-extrabold text-income">
              {currency(Math.max(0, totalLimit - totalSpent))}
            </p>
          </div>
        </div>
        <Progress
          value={Math.min(100, Math.round((totalSpent / (totalLimit || 1)) * 100))}
          className="mt-4 h-2.5"
        />
        <p className="mt-2 text-xs text-muted-foreground">
          {currency(totalSpent)} spent of {currency(totalLimit)}
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((b) => {
          const cat = catById[b.categoryId];
          const over = b.spent > b.limit;
          const near = !over && b.pct >= 80;
          return (
            <article key={b.id} className="stat-card p-5">
              <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                <CategoryIcon icon={cat?.icon ?? "Circle"} color={cat?.color ?? "chart-1"} />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{cat?.name ?? "Uncategorized"}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {monthLabel(b.month)}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className={
                    over
                      ? "bg-expense-soft text-expense"
                      : near
                        ? "bg-muted text-warning"
                        : "bg-income-soft text-income"
                  }
                >
                  {over ? "Over" : near ? "Close" : "On track"}
                </Badge>
              </div>

              <p className="mt-4 font-display text-2xl font-extrabold">
                {currency(b.spent)}
                <span className="ml-1 text-sm font-medium text-muted-foreground">
                  / {currency(b.limit)}
                </span>
              </p>
              <Progress value={Math.min(100, b.pct)} className="mt-3 h-2" />
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{b.pct}% used</span>
                <span className={over ? "font-semibold text-expense" : "text-muted-foreground"}>
                  {over
                    ? `${currency(b.spent - b.limit)} over`
                    : `${currency(b.limit - b.spent)} left`}
                </span>
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-xl"
                  onClick={() => {
                    setEditing(b);
                    setOpen(true);
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl text-destructive hover:text-destructive"
                  onClick={() => {
                    deleteBudget(b.id);
                    toast.success("Budget removed");
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      <BudgetDialog open={open} onOpenChange={setOpen} editing={editing} />
    </AppShell>
  );
}
