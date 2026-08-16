import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENT_MONTH, useFinance, type Transaction, type TxType } from "@/lib/finance-store";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing?: Transaction | null;
};

export function TransactionDialog({ open, onOpenChange, editing }: Props) {
  const { categories, addTransaction, updateTransaction } = useFinance();
  const [type, setType] = useState<TxType>("expense");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [date, setDate] = useState(`${CURRENT_MONTH}-16`);
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!open) return;
    setType(editing?.type ?? "expense");
    setAmount(editing ? String(editing.amount) : "");
    setCategoryId(editing?.categoryId ?? categories[0]?.id ?? "");
    setDate(editing?.date ?? `${CURRENT_MONTH}-16`);
    setDescription(editing?.description ?? "");
  }, [open, editing, categories]);

  const submit = () => {
    const value = Number(amount);
    if (!value || value <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (!categoryId) {
      toast.error("Pick a category");
      return;
    }
    const payload = {
      type,
      amount: value,
      categoryId,
      date,
      description: description.trim() || "Untitled transaction",
    };
    if (editing) {
      updateTransaction(editing.id, payload);
      toast.success("Transaction updated");
    } else {
      addTransaction(payload);
      toast.success("Transaction added");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit transaction" : "Add transaction"}</DialogTitle>
          <DialogDescription>
            Record money coming in or going out of your accounts.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
            {(["expense", "income"] as TxType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold capitalize transition-colors ${
                  type === t
                    ? t === "income"
                      ? "bg-income-soft text-income"
                      : "bg-expense-soft text-expense"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              rows={2}
              placeholder="What was this for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>{editing ? "Save changes" : "Add transaction"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
