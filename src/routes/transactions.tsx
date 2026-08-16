import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { CategoryIcon } from "@/components/category-icon";
import { TransactionDialog } from "@/components/transaction-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  currencyPrecise,
  dateLabel,
  useFinance,
  type Transaction,
} from "@/lib/finance-store";

export const Route = createFileRoute("/transactions")({
  head: () => ({
    meta: [
      { title: "Transactions — SpendWise" },
      {
        name: "description",
        content:
          "Browse, search, filter, edit and delete every income and expense entry in your SpendWise ledger.",
      },
      { property: "og:title", content: "Transactions — SpendWise" },
      {
        property: "og:description",
        content: "A searchable ledger of all your income and expense transactions.",
      },
    ],
  }),
  component: TransactionsPage,
});

function TransactionsPage() {
  const { transactions, categories, deleteTransaction } = useFinance();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [category, setCategory] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Transaction | null>(null);

  const catById = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c])),
    [categories],
  );

  const rows = transactions.filter((t) => {
    const matchQuery =
      !query ||
      t.description.toLowerCase().includes(query.toLowerCase()) ||
      (catById[t.categoryId]?.name ?? "").toLowerCase().includes(query.toLowerCase());
    const matchType = type === "all" || t.type === type;
    const matchCat = category === "all" || t.categoryId === category;
    return matchQuery && matchType && matchCat;
  });

  const totalIn = rows.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalOut = rows.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  return (
    <AppShell
      title="Transactions"
      subtitle="Every dollar in and out, in one ledger"
      actions={
        <Button
          className="rounded-xl"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Transaction</span>
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="stat-card p-4">
          <p className="text-sm text-muted-foreground">Matching entries</p>
          <p className="mt-1 font-display text-2xl font-extrabold">{rows.length}</p>
        </div>
        <div className="stat-card p-4">
          <p className="text-sm text-muted-foreground">Income</p>
          <p className="mt-1 font-display text-2xl font-extrabold text-income">
            {currencyPrecise(totalIn)}
          </p>
        </div>
        <div className="stat-card p-4">
          <p className="text-sm text-muted-foreground">Expenses</p>
          <p className="mt-1 font-display text-2xl font-extrabold text-expense">
            {currencyPrecise(totalOut)}
          </p>
        </div>
      </div>

      <div className="stat-card mt-6 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-4 md:flex-row md:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search description or category"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="rounded-xl pl-9"
            />
          </div>
          <div className="flex gap-3">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full rounded-xl md:w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full rounded-xl md:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[220px]">Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((t) => {
                const cat = catById[t.categoryId];
                return (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.description}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        <CategoryIcon
                          icon={cat?.icon ?? "Circle"}
                          color={cat?.color ?? "chart-1"}
                          className="h-8 w-8"
                        />
                        <span className="text-sm text-muted-foreground">
                          {cat?.name ?? "Uncategorized"}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          t.type === "income"
                            ? "bg-income-soft text-income"
                            : "bg-expense-soft text-expense"
                        }
                      >
                        {t.type === "income" ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3" />
                        )}
                        {t.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {dateLabel(t.date)}
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold whitespace-nowrap ${
                        t.type === "income" ? "text-income" : "text-expense"
                      }`}
                    >
                      {t.type === "income" ? "+" : "−"}
                      {currencyPrecise(t.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditing(t);
                            setDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setPendingDelete(t)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                    No transactions match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <TransactionDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} />

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(v) => !v && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              "{pendingDelete?.description}" will be removed from your ledger.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete) deleteTransaction(pendingDelete.id);
                setPendingDelete(null);
                toast.success("Transaction deleted");
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
