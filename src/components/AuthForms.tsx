import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { isSupabaseConfigured } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  username: z.string().trim().min(2, "Nome muito curto").max(40),
  password: z.string().min(6, "Mínimo 6 caracteres").max(72),
});
const signupSchema = loginSchema.extend({
  nomeLoja: z.string().trim().min(2, "Nome muito curto").max(80),
});

export function AuthForms({ onSuccess }: { onSuccess?: () => void }) {
  const { signIn, signUp } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [busy, setBusy] = useState(false);

  const goAfter = () => {
    onSuccess?.();
    nav({ to: "/painel" });
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      toast.error("Backend não configurado.");
      return;
    }
    const fd = new FormData(e.currentTarget);
    const parsed = loginSchema.safeParse({
      username: fd.get("username"),
      password: fd.get("password"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }
    setBusy(true);
    try {
      await signIn(parsed.data.username, parsed.data.password);
      toast.success("Bem-vindo de volta!");
      goAfter();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao iniciar sessão";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      toast.error("Backend não configurado.");
      return;
    }
    const fd = new FormData(e.currentTarget);
    const parsed = signupSchema.safeParse({
      username: fd.get("username"),
      password: fd.get("password"),
      nomeLoja: fd.get("nomeLoja"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }
    setBusy(true);
    try {
      await signUp(parsed.data.username, parsed.data.password, parsed.data.nomeLoja);
      toast.success("Conta criada! Bem-vindo.");
      goAfter();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao criar conta";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")}>
      <TabsList className="grid grid-cols-2 w-full mb-4">
        <TabsTrigger value="login">Entrar</TabsTrigger>
        <TabsTrigger value="signup">Criar conta</TabsTrigger>
      </TabsList>

      <TabsContent value="login">
        <form onSubmit={handleLogin} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="login-username">Nome de utilizador</Label>
            <Input id="login-username" name="username" type="text" autoComplete="username" required maxLength={40} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="login-password">Palavra-passe</Label>
            <Input id="login-password" name="password" type="password" autoComplete="current-password" required />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="signup">
        <form onSubmit={handleSignup} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="signup-loja">Nome da loja</Label>
            <Input id="signup-loja" name="nomeLoja" required maxLength={80} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="signup-username">Nome de utilizador</Label>
            <Input id="signup-username" name="username" type="text" autoComplete="username" required maxLength={40} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="signup-password">Palavra-passe</Label>
            <Input id="signup-password" name="password" type="password" autoComplete="new-password" required minLength={6} />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar conta"}
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  );
}
