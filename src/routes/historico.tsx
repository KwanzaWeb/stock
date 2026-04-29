import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownCircle, ArrowUpCircle, History as HistoryIcon } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase, type Movimentacao } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/historico")({
  head: () => ({
    meta: [
      { title: "Histórico — StockSimples" },
      { name: "description", content: "Histórico de entradas e saídas de stock." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <AppShell>
        <Historico />
      </AppShell>
    </RequireAuth>
  ),
});

type MovComProduto = Movimentacao & { produtos: { nome: string } | null };

function Historico() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["movimentacoes", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<MovComProduto[]> => {
      const { data, error } = await supabase
        .from("movimentacoes")
        .select("*, produtos(nome)")
        .order("data", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as MovComProduto[];
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Histórico</h2>
        <p className="text-sm text-muted-foreground">Últimas 100 movimentações</p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : !data?.length ? (
        <Card className="p-8 text-center">
          <HistoryIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Sem movimentações ainda. Use os botões + / − para registar.
          </p>
        </Card>
      ) : (
        <ul className="space-y-2">
          {data.map((m) => {
            const entrada = m.tipo === "entrada";
            return (
              <Card key={m.id} className="p-3 flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                    entrada
                      ? "bg-success/10 text-success"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {entrada ? (
                    <ArrowUpCircle className="h-5 w-5" />
                  ) : (
                    <ArrowDownCircle className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">
                    {m.produtos?.nome ?? "Produto removido"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(m.data).toLocaleString("pt-PT")}
                  </p>
                </div>
                <div
                  className={`font-bold text-sm shrink-0 ${
                    entrada ? "text-success" : "text-destructive"
                  }`}
                >
                  {entrada ? "+" : "−"}
                  {m.quantidade}
                </div>
              </Card>
            );
          })}
        </ul>
      )}
    </div>
  );
}
