import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Tags,
  Search,
  Menu,
  X,
  PiggyBank,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const nav = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Transactions", url: "/transactions", icon: ArrowLeftRight },
  { title: "Budgets", url: "/budgets", icon: Wallet },
  { title: "Categories", url: "/categories", icon: Tags },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="flex flex-col gap-1 px-3">
      {nav.map((item) => {
        const active = pathname === item.url;
        return (
          <Link
            key={item.url}
            to={item.url}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-card"
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <item.icon className="h-[18px] w-[18px] shrink-0" />
            <span className="truncate">{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  return (
    <div className="flex h-full flex-col bg-sidebar py-5 text-sidebar-foreground">
      <div className="flex items-center gap-3 px-6 pb-6">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
          <PiggyBank className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="font-display text-lg leading-none font-extrabold tracking-tight">
            SpendWise
          </p>
          <p className="mt-1 text-xs text-sidebar-foreground/60">Personal finance</p>
        </div>
      </div>

      <p className="px-6 pb-2 text-[11px] font-semibold tracking-[0.14em] text-sidebar-foreground/45 uppercase">
        Menu
      </p>
      <NavLinks onNavigate={onNavigate} />

      <div className="mt-auto px-4 pt-6">
        <div className="rounded-2xl bg-sidebar-accent p-4">
          <p className="text-sm font-semibold text-sidebar-accent-foreground">
            August on track
          </p>
          <p className="mt-1 text-xs text-sidebar-foreground/65">
            You are spending 12% less than last month. Keep it up.
          </p>
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-2xl px-2 py-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sidebar-accent text-sm font-bold text-sidebar-accent-foreground">
            AR
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">Aswin Raj</p>
            <p className="truncate text-xs text-sidebar-foreground/60">
              aswin@spendwise.app
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="min-h-screen w-full bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-sidebar-border lg:block">
        <SidebarBody />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 shadow-lift">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-3 z-10 text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            <SidebarBody onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6 lg:py-4">
            <div className="flex min-w-0 items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 lg:hidden"
                onClick={() => setOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold sm:text-xl">{title}</h1>
                {subtitle && (
                  <p className="hidden truncate text-sm text-muted-foreground sm:block">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <div className="relative hidden md:block">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search"
                  className="w-48 rounded-xl bg-card pl-9 lg:w-60"
                />
              </div>
              <Button variant="outline" size="icon" className="rounded-xl">
                <Bell className="h-4 w-4" />
              </Button>
              {actions}
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
