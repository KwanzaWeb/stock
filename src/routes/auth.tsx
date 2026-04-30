import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { isSupabaseConfigured } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Package, Loader2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — StockSimples" },
      { name: "description", content: "Aceda à sua conta StockSimples." },
    ],
  }),
  component: AuthPage,
});

const loginSchema = z.object({
  username: z.string().trim().min(2, "Nome muito curto").max(40),
  password: z.string().min(6, "Mínimo 6 caracteres").max(72),
});
const signupSchema = loginSchema.extend({
  nomeLoja: z.string().trim().min(2, "Nome muito curto").max(80),
});

function AuthPage() {
  const { signIn, signUp, user } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) nav({ to: "/" });
  }, [user, nav]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      toast.error("Backend não configurado. Edite o ficheiro .env com as credenciais do Supabase.");
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
      nav({ to: "/" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao iniciar sessão";
      toast.error(msg.includes("fetch") ? "Não foi possível ligar ao servidor. Verifique o .env." : msg);
    } finally {
      setBusy(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      toast.error("Backend não configurado. Edite o ficheiro .env com as credenciais do Supabase.");
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
      nav({ to: "/" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao criar conta";
      toast.error(msg.includes("fetch") ? "Não foi possível ligar ao servidor. Verifique o .env." : msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-[var(--gradient-subtle)]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-[var(--gradient-primary)] flex items-center justify-center shadow-[var(--shadow-elegant)] mb-3">
            <Package className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">StockSimples</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestão de stock para o seu negócio
          </p>
        </div>

        {!isSupabaseConfigured && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Backend ainda não ligado</AlertTitle>
            <AlertDescription className="text-xs leading-relaxed">
              Edite o ficheiro <code className="font-mono">.env</code> com o
              <strong> Project URL</strong> e <strong>anon key</strong> do seu Supabase
              Kwanzaweb (Dashboard → Settings → API). Depois, recarregue esta página.
            </AlertDescription>
          </Alert>
        )}

        <Card className="p-5">
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
        </Card>
      </div>
    </div>
  );
}
