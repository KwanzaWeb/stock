import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "sonner";
import { ArrowDownCircle, ArrowUpCircle, History as HistoryIcon, Send } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase, type Movimentacao } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { useProdutos } from "@/lib/queries";
import { getOwnerPhone } from "./definicoes";

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

type MovComProduto = Movimentacao & {
  produtos: { nome: string; preco_venda: number } | null;
};

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function Historico() {
  const { user } = useAuth();
  const { data: produtos } = useProdutos();
  const { data, isLoading } = useQuery({
    queryKey: ["movimentacoes", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<MovComProduto[]> => {
      const { data, error } = await supabase
        .from("movimentacoes")
        .select("*, produtos(nome, preco_venda)")
        .order("data", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as MovComProduto[];
    },
  });

  const vendasHoje = useMemo(() => {
    const inicio = startOfToday().getTime();
    return (data ?? []).filter(
      (m) => m.tipo === "saida" && new Date(m.data).getTime() >= inicio
    );
  }, [data]);

  const handleSubmeter = () => {
    if (!user) return;
    const phone = getOwnerPhone(user.id).replace(/[^\d+]/g, "").replace(/^\+/, "");
    if (!phone) {
      toast.error("Configure o número do dono em Definições primeiro.");
      return;
    }
    if (vendasHoje.length === 0) {
      toast.error("Não há vendas registadas hoje.");
      return;
    }

    // Agrupar por produto
    const agrupado = new Map<string, { nome: string; qtd: number; total: number }>();
    let totalGeral = 0;
    let qtdTotal = 0;
    for (const m of vendasHoje) {
      const nome = m.produtos?.nome ?? "Produto removido";
      const preco = Number(m.produtos?.preco_venda ?? 0);
      const subtotal = m.quantidade * preco;
      totalGeral += subtotal;
      qtdTotal += m.quantidade;
      const a = agrupado.get(m.produto_id) ?? { nome, qtd: 0, total: 0 };
      a.qtd += m.quantidade;
      a.total += subtotal;
      agrupado.set(m.produto_id, a);
    }

    const criticos = (produtos ?? []).filter(
      (p) => p.quantidade_atual <= p.alerta_minimo
    );

    const fmt = (v: number) =>
      new Intl.NumberFormat("pt-PT", { maximumFractionDigits: 0 }).format(v);

    const dataStr = new Date().toLocaleDateString("pt-PT");

    let msg = `📊 *Relatório de Vendas — ${dataStr}*\n\n`;
    msg += `💰 Total: *${fmt(totalGeral)} Kz*\n`;
    msg += `📦 Itens vendidos: ${qtdTotal}\n`;
    msg += `🧾 Transações: ${vendasHoje.length}\n\n`;
    msg += `*Detalhe das vendas:*\n`;
    for (const a of agrupado.values()) {
      msg += `• ${a.nome} — ${a.qtd}x = ${fmt(a.total)} Kz\n`;
    }

    if (criticos.length > 0) {
      msg += `\n⚠️ *Stock crítico (${criticos.length}):*\n`;
      for (const p of criticos) {
        msg += `• ${p.nome} — ${p.quantidade_atual} (mín ${p.alerta_minimo})\n`;
      }
    }

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    toast.success("A abrir WhatsApp...");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Histórico</h2>
          <p className="text-sm text-muted-foreground">Últimas 100 movimentações</p>
        </div>
      </div>

      <Card className="p-4 bg-[var(--gradient-primary)] text-primary-foreground border-0">
        <p className="text-xs text-primary-foreground/80">Vendas de hoje</p>
        <p className="text-2xl font-bold mt-0.5">
          {vendasHoje.length} transaç{vendasHoje.length === 1 ? "ão" : "ões"}
        </p>
        <Button
          onClick={handleSubmeter}
          variant="secondary"
          className="w-full mt-3"
        >
          <Send className="h-4 w-4 mr-2" />
          Submeter relatório do dia
        </Button>
      </Card>

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
