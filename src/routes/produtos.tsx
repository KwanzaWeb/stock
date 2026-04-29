import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import {
  Plus, Minus, Search, Trash2, MessageCircle, AlertTriangle, PackagePlus,
} from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useProdutos } from "@/lib/queries";
import { supabase, type Produto } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/produtos")({
  head: () => ({
    meta: [
      { title: "Stock — StockSimples" },
      { name: "description", content: "Faça a gestão dos seus produtos em stock." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <AppShell>
        <ProdutosPage />
      </AppShell>
    </RequireAuth>
  ),
});

const produtoSchema = z.object({
  nome: z.string().trim().min(1, "Nome obrigatório").max(120),
  descricao: z.string().trim().max(500).optional(),
  quantidade_atual: z.coerce.number().int().min(0).max(1_000_000),
  alerta_minimo: z.coerce.number().int().min(0).max(1_000_000),
  preco_venda: z.coerce.number().min(0).max(1_000_000_000),
  contacto_fornecedor: z.string().trim().max(30).optional(),
});

function sanitizePhone(p: string | null | undefined) {
  if (!p) return "";
  return p.replace(/[^\d+]/g, "").replace(/^\+/, "");
}

function ProdutosPage() {
  const { data, isLoading } = useProdutos();
  const [q, setQ] = useState("");
  const [openNew, setOpenNew] = useState(false);

  const filtered = useMemo(() => {
    const list = data ?? [];
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter(
      (p) =>
        p.nome.toLowerCase().includes(term) ||
        (p.descricao ?? "").toLowerCase().includes(term)
    );
  }, [data, q]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Stock</h2>
          <p className="text-sm text-muted-foreground">
            {data?.length ?? 0} produto{data?.length === 1 ? "" : "s"}
          </p>
        </div>
        <Dialog open={openNew} onOpenChange={setOpenNew}>
          <DialogTrigger asChild>
            <Button size="sm">
              <PackagePlus className="h-4 w-4 mr-1" /> Novo
            </Button>
          </DialogTrigger>
          <ProdutoDialog onClose={() => setOpenNew(false)} />
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar produto..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <PackagePlus className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            {q ? "Nenhum produto encontrado." : "Adicione o seu primeiro produto."}
          </p>
        </Card>
      ) : (
        <ul className="space-y-2">
          {filtered.map((p) => (
            <ProdutoRow key={p.id} produto={p} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ProdutoRow({ produto }: { produto: Produto }) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const critico = produto.quantidade_atual <= produto.alerta_minimo;
  const [openEdit, setOpenEdit] = useState(false);

  const adjust = useMutation({
    mutationFn: async (delta: number) => {
      const nova = produto.quantidade_atual + delta;
      if (nova < 0) throw new Error("Quantidade não pode ser negativa");
      const { error: e1 } = await supabase
        .from("produtos")
        .update({ quantidade_atual: nova })
        .eq("id", produto.id);
      if (e1) throw e1;
      const { error: e2 } = await supabase.from("movimentacoes").insert({
        user_id: user!.id,
        produto_id: produto.id,
        tipo: delta > 0 ? "entrada" : "saida",
        quantidade: Math.abs(delta),
      });
      if (e2) throw e2;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["produtos"] });
      qc.invalidateQueries({ queryKey: ["movimentacoes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleWhats = () => {
    const phone = sanitizePhone(produto.contacto_fornecedor);
    if (!phone) {
      toast.error("Adicione um contacto de fornecedor primeiro.");
      return;
    }
    const msg = encodeURIComponent(
      `Olá, preciso de encomendar mais ${produto.nome}.`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank", "noopener,noreferrer");
  };

  return (
    <Card className={`p-3 ${critico ? "border-destructive/40 bg-destructive/5" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <button
          onClick={() => setOpenEdit(true)}
          className="text-left min-w-0 flex-1"
        >
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm truncate">{produto.nome}</p>
            {critico && (
              <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {Number(produto.preco_venda).toLocaleString("pt-PT")} Kz · mín{" "}
            {produto.alerta_minimo}
          </p>
        </button>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8"
            disabled={adjust.isPending || produto.quantidade_atual === 0}
            onClick={() => adjust.mutate(-1)}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span
            className={`min-w-10 text-center font-bold ${
              critico ? "text-destructive" : "text-foreground"
            }`}
          >
            {produto.quantidade_atual}
          </span>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8"
            disabled={adjust.isPending}
            onClick={() => adjust.mutate(1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {critico && (
        <Button
          size="sm"
          variant="destructive"
          className="w-full mt-3"
          onClick={handleWhats}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Contactar fornecedor
        </Button>
      )}

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <ProdutoDialog produto={produto} onClose={() => setOpenEdit(false)} />
      </Dialog>
    </Card>
  );
}

function ProdutoDialog({
  produto,
  onClose,
}: {
  produto?: Produto;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const isEdit = !!produto;
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = produtoSchema.safeParse({
      nome: fd.get("nome"),
      descricao: fd.get("descricao") || undefined,
      quantidade_atual: fd.get("quantidade_atual"),
      alerta_minimo: fd.get("alerta_minimo"),
      preco_venda: fd.get("preco_venda"),
      contacto_fornecedor: fd.get("contacto_fornecedor") || undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }
    setBusy(true);
    try {
      if (isEdit) {
        const { error } = await supabase
          .from("produtos")
          .update(parsed.data)
          .eq("id", produto!.id);
        if (error) throw error;
        toast.success("Produto atualizado");
      } else {
        const { error } = await supabase
          .from("produtos")
          .insert({ ...parsed.data, user_id: user!.id });
        if (error) throw error;
        toast.success("Produto adicionado");
      }
      qc.invalidateQueries({ queryKey: ["produtos"] });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao guardar";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!produto) return;
    if (!confirm(`Eliminar "${produto.nome}"?`)) return;
    setBusy(true);
    const { error } = await supabase.from("produtos").delete().eq("id", produto.id);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Produto eliminado");
    qc.invalidateQueries({ queryKey: ["produtos"] });
    onClose();
  };

  return (
    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{isEdit ? "Editar produto" : "Novo produto"}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="nome">Nome</Label>
          <Input id="nome" name="nome" defaultValue={produto?.nome} required maxLength={120} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea
            id="descricao"
            name="descricao"
            defaultValue={produto?.descricao ?? ""}
            rows={2}
            maxLength={500}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="quantidade_atual">Quantidade</Label>
            <Input
              id="quantidade_atual"
              name="quantidade_atual"
              type="number"
              min={0}
              defaultValue={produto?.quantidade_atual ?? 0}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="alerta_minimo">Alerta mín.</Label>
            <Input
              id="alerta_minimo"
              name="alerta_minimo"
              type="number"
              min={0}
              defaultValue={produto?.alerta_minimo ?? 5}
              required
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="preco_venda">Preço de venda (Kz)</Label>
          <Input
            id="preco_venda"
            name="preco_venda"
            type="number"
            min={0}
            step="0.01"
            defaultValue={produto?.preco_venda ?? 0}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contacto_fornecedor">WhatsApp do fornecedor</Label>
          <Input
            id="contacto_fornecedor"
            name="contacto_fornecedor"
            type="tel"
            placeholder="+244912345678"
            defaultValue={produto?.contacto_fornecedor ?? ""}
            maxLength={30}
          />
          <p className="text-[11px] text-muted-foreground">
            Inclua o indicativo do país. Ex: +244 para Angola.
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
          {isEdit && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleDelete}
              disabled={busy}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive sm:mr-auto"
            >
              <Trash2 className="h-4 w-4 mr-1" /> Eliminar
            </Button>
          )}
          <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button type="submit" disabled={busy}>
            {isEdit ? "Guardar" : "Adicionar"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
