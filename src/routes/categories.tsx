import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { CategoryIcon } from "@/components/category-icon";
import { CategoryDialog } from "@/components/category-dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  CURRENT_MONTH,
  currency,
  monthLabel,
  useFinance,
  type Category,
} from "@/lib/finance-store";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — SpendWise" },
      {
        name: "description",
        content:
          "Organize spending with custom categories, colored icons and month-to-date totals for each one.",
      },
      { property: "og:title", content: "Categories — SpendWise" },
      {
        property: "og:description",
        content: "Create, edit and delete spending categories with per-category totals.",
      },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { categories, transactions, deleteCategory } = useFinance();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);

  const monthTx = useMemo(
    () =>
      transactions.filter(
        (t) => t.date.startsWith(CURRENT_MONTH) && t.type === "expense",
      ),
    [transactions],
  );

  const totalSpend = monthTx.reduce((s, t) => s + t.amount, 0);

  const rows = categories
    .map((c) => {
      const items = monthTx.filter((t) => t.categoryId === c.id);
      const spent = items.reduce((s, t) => s + t.amount, 0);
      return {
        ...c,
        spent,
        count: items.length,
        share: totalSpend ? Math.round((spent / totalSpend) * 100) : 0,
      };
    })
    .sort((a, b) => b.spent - a.spent);

  return (
    <AppShell
      title="Categories"
      subtitle={`Spending buckets · ${monthLabel(CURRENT_MONTH)}`}
      actions={
        <Button
          className="rounded-xl"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Category</span>
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((c) => (
          <article key={c.id} className="stat-card p-5">
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
              <CategoryIcon icon={c.icon} color={c.color} />
              <div className="min-w-0">
                <p className="truncate font-semibold">{c.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {c.count} transaction{c.count === 1 ? "" : "s"} this month
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditing(c);
                    setOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setPendingDelete(c)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <p className="mt-4 font-display text-2xl font-extrabold">{currency(c.spent)}</p>
            <Progress value={c.share} className="mt-3 h-2" />
            <p className="mt-2 text-xs text-muted-foreground">
              {c.share}% of this month's spending
            </p>
          </article>
        ))}
      </div>

      <CategoryDialog open={open} onOpenChange={setOpen} editing={editing} />

      <AlertDialog open={!!pendingDelete} onOpenChange={(v) => !v && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{pendingDelete?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Transactions and budgets in this category will also be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete) deleteCategory(pendingDelete.id);
                setPendingDelete(null);
                toast.success("Category deleted");
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
