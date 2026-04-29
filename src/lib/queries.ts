import { useQuery } from "@tanstack/react-query";
import { supabase, type Produto } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

export function useProdutos() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["produtos", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Produto[]> => {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .order("nome", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Produto[];
    },
  });
}
