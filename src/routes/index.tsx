import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Bot,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  Target,
  Wallet,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SpendWise — Futuristic Personal Finance OS" },
      {
        name: "description",
        content:
          "SpendWise turns your income, spending and budgets into a live financial control room. Track, plan and grow with clarity.",
      },
      { property: "og:title", content: "SpendWise — Futuristic Personal Finance OS" },
      {
        property: "og:description",
        content:
          "A live control room for your money: real-time balance, smart budgets and category insight.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: BarChart3,
    title: "Live money telemetry",
    body: "Income, expenses and net balance recalculated the instant anything changes.",
  },
  {
    icon: Target,
    title: "Budgets that push back",
    body: "Category limits with progress rings that warn you before you overshoot.",
  },
  {
    icon: Bot,
    title: "Pattern detection",
    body: "Spot the categories quietly eating your month, ranked by real share of spend.",
  },
  {
    icon: ShieldCheck,
    title: "Yours only",
    body: "Your ledger stays in your workspace. No noise, no ads, no resold data.",
  },
];

const stats = [
  { value: "12%", label: "Average monthly spend cut" },
  { value: "<1s", label: "Dashboard recalculation" },
  { value: "8", label: "Smart spend categories" },
  { value: "24/7", label: "Always-on tracking" },
];

function Landing() {
  return (
    <div className="dark relative min-h-screen overflow-hidden bg-background text-foreground">
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

      <div className="relative">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-lift">
              <PiggyBank className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight">
              SpendWise
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="hidden sm:inline-flex rounded-xl">
              <Link to="/transactions">Transactions</Link>
            </Button>
            <Button asChild className="rounded-xl">
              <Link to="/dashboard">
                Open app <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-5 pt-10 pb-20 text-center sm:pt-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium tracking-wide text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            The finance control room for everyday money
          </span>

          <h1 className="mx-auto mt-7 max-w-3xl font-display text-4xl leading-[1.05] font-extrabold sm:text-6xl">
            Your money, rendered in{" "}
            <span className="bg-gradient-to-r from-primary via-chart-2 to-chart-5 bg-clip-text text-transparent">
              real time
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            SpendWise fuses your income, spending and budgets into one luminous
            dashboard — so every decision is made with the full picture in view.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="rounded-xl shadow-lift">
              <Link to="/dashboard">
                Launch dashboard <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl bg-card/50">
              <Link to="/budgets">Explore budgets</Link>
            </Button>
          </div>

          {/* holographic preview panel */}
          <div className="relative mx-auto mt-16 max-w-4xl">
            <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-primary/50 via-chart-2/40 to-chart-5/50 blur-[2px]" />
            <div className="relative rounded-3xl border border-border bg-card/70 p-5 backdrop-blur-xl sm:p-7">
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Balance", value: "₹1,24,860", tone: "text-primary" },
                  { label: "Income", value: "₹2,10,000", tone: "text-income" },
                  { label: "Expenses", value: "₹85,140", tone: "text-expense" },
                ].map((c) => (
                  <div
                    key={c.label}
                    className="rounded-2xl border border-border bg-background/50 p-4 text-left"
                  >
                    <p className="text-xs tracking-wide text-muted-foreground uppercase">
                      {c.label}
                    </p>
                    <p className={`mt-2 font-display text-2xl font-extrabold ${c.tone}`}>
                      {c.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex h-40 items-end gap-2 rounded-2xl border border-border bg-background/40 p-4 sm:h-48">
                {[38, 62, 45, 78, 55, 88, 40, 70, 52, 95, 61, 74].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-md bg-gradient-to-t from-primary/25 to-primary"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-20">
          <div className="grid gap-4 rounded-3xl border border-border bg-card/50 p-6 backdrop-blur sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-display text-3xl font-extrabold text-primary">
                  {s.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-24">
          <h2 className="text-center font-display text-3xl font-extrabold sm:text-4xl">
            Built for people who want the whole picture
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-muted-foreground">
            Four systems working together to keep your month on plan.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {features.map((f) => (
              <div
                key={f.title}
                className="group relative overflow-hidden rounded-3xl border border-border bg-card/60 p-6 backdrop-blur transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lift"
              >
                <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover:opacity-100 sm:opacity-0" />
                <span className="relative grid h-11 w-11 place-items-center rounded-xl bg-accent text-accent-foreground">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="relative mt-4 text-lg font-bold">{f.title}</h3>
                <p className="relative mt-2 text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-24">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card/60 px-6 py-14 text-center backdrop-blur">
            <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/30 blur-[100px]" />
            <span className="relative inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
              <Zap className="h-3.5 w-3.5 text-primary" /> No setup required
            </span>
            <h2 className="relative mt-5 font-display text-3xl font-extrabold sm:text-4xl">
              Step into your financial control room
            </h2>
            <p className="relative mx-auto mt-3 max-w-md text-muted-foreground">
              Everything is preloaded. Open the dashboard and start steering your month.
            </p>
            <Button asChild size="lg" className="relative mt-7 rounded-xl shadow-lift">
              <Link to="/dashboard">
                <Wallet className="mr-1 h-4 w-4" /> Enter SpendWise
              </Link>
            </Button>
          </div>
        </section>

        <footer className="border-t border-border">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-7 text-sm text-muted-foreground sm:flex-row">
            <p>© 2026 SpendWise. Personal finance, clarified.</p>
            <div className="flex gap-5">
              <Link to="/dashboard" className="hover:text-foreground">
                Dashboard
              </Link>
              <Link to="/budgets" className="hover:text-foreground">
                Budgets
              </Link>
              <Link to="/categories" className="hover:text-foreground">
                Categories
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
