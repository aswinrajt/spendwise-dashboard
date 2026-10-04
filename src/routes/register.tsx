import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PiggyBank } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { requireGuest } from "@/lib/auth-guard";

export const Route = createFileRoute("/register")({
  ssr: false,
  beforeLoad: requireGuest,
  head: () => ({
    meta: [{ title: "Create account — SpendWise" }],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await register(name, email, password);
      await navigate({ to: "/dashboard" });
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Could not create account",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="dark relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 text-foreground">
      {/* aurora backdrop */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-32 h-[38rem] w-[38rem] rounded-full bg-primary/25 blur-[140px]" />
        <div className="absolute -top-20 right-0 h-[32rem] w-[32rem] rounded-full bg-chart-2/25 blur-[150px]" />
        <div className="absolute bottom-0 left-1/3 h-[30rem] w-[30rem] rounded-full bg-chart-5/20 blur-[150px]" />
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse at 50% 0%, black 30%, transparent 75%)",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <Link to="/" className="mb-8 flex items-center justify-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-lift">
            <PiggyBank className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight">
            SpendWise
          </span>
        </Link>
        <form onSubmit={submit} className="stat-card space-y-4 p-6 backdrop-blur-md">
          <div>
            <h1 className="text-xl font-bold">Create account</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Start with empty books and the default categories.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full rounded-xl" disabled={busy}>
            {busy ? "Creating…" : "Create account"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-foreground underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
