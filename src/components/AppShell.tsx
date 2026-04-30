import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Package, History, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { signOut, user } = useAuth();
  const nav = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = async () => {
    await signOut();
    nav({ to: "/" });
  };

  const tabs = [
    { to: "/painel", label: "Início", icon: LayoutDashboard },
    { to: "/produtos", label: "Stock", icon: Package },
    { to: "/historico", label: "Histórico", icon: History },
    { to: "/definicoes", label: "Definições", icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-[var(--gradient-subtle)] flex flex-col pb-20 md:pb-0">
      <header className="sticky top-0 z-30 bg-primary text-primary-foreground shadow-[var(--shadow-card)]">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary-foreground/15 flex items-center justify-center font-bold">
              S
            </div>
            <div className="leading-tight">
              <h1 className="font-semibold text-base">StockSimples</h1>
              <p className="text-[11px] text-primary-foreground/70 truncate max-w-[180px]">
                {user?.email}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleLogout}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-4">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 md:static md:max-w-3xl md:mx-auto md:mt-0 bg-card border-t md:border-t-0 md:border md:rounded-2xl md:my-4 md:shadow-[var(--shadow-card)]">
        <div className="grid grid-cols-4">
          {tabs.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "text-primary" : ""}`} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
