import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_KWANZA_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_KWANZA_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.warn(
    "Supabase Kwanzaweb not configured. Set VITE_KWANZA_SUPABASE_URL and VITE_KWANZA_SUPABASE_ANON_KEY in .env"
  );
}

export const supabase = createClient(SUPABASE_URL ?? "", SUPABASE_ANON_KEY ?? "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});

export type Produto = {
  id: string;
  user_id: string;
  nome: string;
  descricao: string | null;
  quantidade_atual: number;
  alerta_minimo: number;
  preco_venda: number;
  contacto_fornecedor: string | null;
  created_at: string;
  updated_at: string;
};

export type Movimentacao = {
  id: string;
  user_id: string;
  produto_id: string;
  tipo: "entrada" | "saida";
  quantidade: number;
  data: string;
};
