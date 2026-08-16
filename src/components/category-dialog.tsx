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
import { getIcon } from "@/components/category-icon";
import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  useFinance,
  type Category,
} from "@/lib/finance-store";

export function CategoryDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing?: Category | null;
}) {
  const { addCategory, updateCategory } = useFinance();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<string>(CATEGORY_ICONS[0]);
  const [color, setColor] = useState<string>(CATEGORY_COLORS[0]);

  useEffect(() => {
    if (!open) return;
    setName(editing?.name ?? "");
    setIcon(editing?.icon ?? CATEGORY_ICONS[0]);
    setColor(editing?.color ?? CATEGORY_COLORS[0]);
  }, [open, editing]);

  const submit = () => {
    if (!name.trim()) {
      toast.error("Give the category a name");
      return;
    }
    if (editing) {
      updateCategory(editing.id, { name: name.trim(), icon, color });
      toast.success("Category updated");
    } else {
      addCategory({ name: name.trim(), icon, color });
      toast.success("Category created");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit category" : "New category"}</DialogTitle>
          <DialogDescription>
            Categories group your spending so the charts stay meaningful.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="cat-name">Name</Label>
            <Input
              id="cat-name"
              placeholder="e.g. Subscriptions"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label>Icon</Label>
            <div className="grid grid-cols-6 gap-2">
              {CATEGORY_ICONS.map((n) => {
                const Icon = getIcon(n);
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setIcon(n)}
                    className={`grid h-10 place-items-center rounded-xl border transition-colors ${
                      icon === n
                        ? "border-primary bg-accent text-accent-foreground"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              {CATEGORY_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={c}
                  className={`h-9 w-9 rounded-full border-2 transition-transform ${
                    color === c ? "scale-110 border-foreground" : "border-transparent"
                  }`}
                  style={{ backgroundColor: `var(--${c})` }}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>{editing ? "Save changes" : "Create category"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
