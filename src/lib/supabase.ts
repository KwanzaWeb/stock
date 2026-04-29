import { createClient } from "@supabase/supabase-js";

const RAW_URL = (import.meta.env.VITE_KWANZA_SUPABASE_URL as string | undefined) ?? "";
const RAW_KEY = (import.meta.env.VITE_KWANZA_SUPABASE_ANON_KEY as string | undefined) ?? "";

// Detecta valores placeholder (não configurados)
const isPlaceholder =
  !RAW_URL ||
  !RAW_KEY ||
  RAW_URL.includes("YOUR-PROJECT-REF") ||
  RAW_URL.includes("your-project-ref") ||
  RAW_KEY.includes("YOUR_ANON") ||
  RAW_KEY.includes("your_anon");

export const isSupabaseConfigured = !isPlaceholder;

if (!isSupabaseConfigured && typeof window !== "undefined") {
  // eslint-disable-next-line no-console
  console.warn(
    "[StockSimples] Supabase não configurado. Edite o ficheiro .env com VITE_KWANZA_SUPABASE_URL e VITE_KWANZA_SUPABASE_ANON_KEY do seu projeto Kwanzaweb."
  );
}

// Usa um URL fictício mas válido para evitar crash do createClient quando ainda não configurado.
const SAFE_URL = isSupabaseConfigured ? RAW_URL : "https://placeholder.supabase.co";
const SAFE_KEY = isSupabaseConfigured ? RAW_KEY : "placeholder-key";

export const supabase = createClient(SAFE_URL, SAFE_KEY, {
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
