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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENT_MONTH, useFinance, type Budget } from "@/lib/finance-store";

export function BudgetDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing?: Budget | null;
}) {
  const { categories, saveBudget } = useFinance();
  const [categoryId, setCategoryId] = useState("");
  const [limit, setLimit] = useState("");

  useEffect(() => {
    if (!open) return;
    setCategoryId(editing?.categoryId ?? categories[0]?.id ?? "");
    setLimit(editing ? String(editing.limit) : "");
  }, [open, editing, categories]);

  const submit = () => {
    const value = Number(limit);
    if (!value || value <= 0) {
      toast.error("Enter a monthly limit");
      return;
    }
    saveBudget({ categoryId, limit: value, month: CURRENT_MONTH }, editing?.id);
    toast.success(editing ? "Budget updated" : "Budget created");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit budget" : "New monthly budget"}</DialogTitle>
          <DialogDescription>
            Set a spending ceiling for a category this month.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
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
            <Label htmlFor="limit">Monthly limit</Label>
            <Input
              id="limit"
              inputMode="decimal"
              placeholder="500"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>{editing ? "Save budget" : "Create budget"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
