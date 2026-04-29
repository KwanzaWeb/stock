import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Package, TrendingUp, AlertTriangle, ArrowRight } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProdutos } from "@/lib/queries";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Painel — StockSimples" },
      { name: "description", content: "Resumo do seu stock e alertas críticos." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <AppShell>
        <Dashboard />
      </AppShell>
    </RequireAuth>
  ),
});

function formatKz(v: number) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "AOA",
    maximumFractionDigits: 0,
  }).format(v);
}

function Dashboard() {
  const { data: produtos, isLoading } = useProdutos();

  const stats = useMemo(() => {
    const list = produtos ?? [];
    const total = list.length;
    const valor = list.reduce((s, p) => s + p.quantidade_atual * Number(p.preco_venda), 0);
    const criticos = list.filter((p) => p.quantidade_atual <= p.alerta_minimo);
    return { total, valor, criticos };
  }, [produtos]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Painel</h2>
        <p className="text-sm text-muted-foreground">Resumo do seu negócio hoje</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Package className="h-5 w-5" />}
          label="Produtos"
          value={isLoading ? null : String(stats.total)}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Valor stock"
          value={isLoading ? null : formatKz(stats.valor)}
          accent
        />
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            <h3 className="font-semibold">Alertas críticos</h3>
          </div>
          {stats.criticos.length > 0 && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground">
              {stats.criticos.length}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : stats.criticos.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Tudo em ordem — nenhum produto abaixo do mínimo. ✓
          </p>
        ) : (
          <ul className="space-y-2">
            {stats.criticos.slice(0, 5).map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-destructive/5 border border-destructive/20"
              >
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{p.nome}</p>
                  <p className="text-xs text-destructive">
                    {p.quantidade_atual} em stock · mín {p.alerta_minimo}
                  </p>
                </div>
                <Link to="/produtos">
                  <Button size="sm" variant="ghost" className="text-destructive">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Link to="/produtos">
        <Button className="w-full" size="lg">
          Gerir stock
        </Button>
      </Link>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
  accent?: boolean;
}) {
  return (
    <Card
      className={`p-4 ${accent ? "bg-[var(--gradient-primary)] text-primary-foreground border-0" : ""}`}
    >
      <div
        className={`h-9 w-9 rounded-lg flex items-center justify-center mb-2 ${
          accent ? "bg-primary-foreground/15" : "bg-primary/10 text-primary"
        }`}
      >
        {icon}
      </div>
      <p className={`text-xs ${accent ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
        {label}
      </p>
      {value === null ? (
        <Skeleton className="h-7 w-20 mt-1" />
      ) : (
        <p className="text-xl font-bold mt-0.5 truncate">{value}</p>
      )}
    </Card>
  );
}
