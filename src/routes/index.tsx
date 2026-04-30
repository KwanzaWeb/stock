import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Package,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  Target,
  Eye,
  Users,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import { AuthForms } from "@/components/AuthForms";
import heroImg from "@/assets/hero-inventario.jpg";
import quemSomosImg from "@/assets/quem-somos.jpg";
import logoImg from "@/assets/logo-stocksimples.jpeg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StockSimples — Gestão de stock simples e inteligente" },
      {
        name: "description",
        content:
          "Controle o inventário da sua loja com simplicidade. Alertas automáticos, relatórios via WhatsApp e visão clara do seu negócio.",
      },
      { property: "og:title", content: "StockSimples — Gestão de stock para o seu negócio" },
      {
        property: "og:description",
        content: "Inventário organizado, alertas críticos e relatórios diários no WhatsApp.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);
  const [defaultTab, setDefaultTab] = useState<"login" | "signup">("login");

  useEffect(() => {
    if (!loading && user) nav({ to: "/painel" });
  }, [loading, user, nav]);

  const openAuth = (tab: "login" | "signup") => {
    setDefaultTab(tab);
    setAuthOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={logoImg}
              alt="StockSimples"
              width={40}
              height={40}
              className="h-10 w-10 rounded-xl object-contain bg-white shadow-[var(--shadow-card)]"
            />
            <span className="font-bold text-lg">StockSimples</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => openAuth("login")}>
              Entrar
            </Button>
            <Button size="sm" onClick={() => openAuth("signup")}>
              Criar conta
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-[var(--gradient-subtle)]">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-20 grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Gestão de stock para pequenos negócios
            </span>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-foreground">
              Stock <span className="text-primary">Simples</span>.<br />
              Negócio mais forte.
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-md">
              Controle o inventário da sua loja em minutos. Receba alertas de stock
              crítico e envie relatórios diários de vendas direto no WhatsApp do dono.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Dialog open={authOpen} onOpenChange={setAuthOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" onClick={() => setDefaultTab("signup")} className="text-base">
                    Começar grátis
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <img src={logoImg} alt="StockSimples" className="h-9 w-9 rounded-xl object-contain bg-white" />
                      Aceder à conta
                    </DialogTitle>
                    <DialogDescription>
                      Entre ou crie a sua conta StockSimples.
                    </DialogDescription>
                  </DialogHeader>
                  <AuthFormsWithDefault
                    defaultTab={defaultTab}
                    onSuccess={() => setAuthOpen(false)}
                  />
                </DialogContent>
              </Dialog>
              <Button size="lg" variant="outline" onClick={() => openAuth("login")}>
                Já tenho conta
              </Button>
            </div>
            <div className="flex items-center gap-4 pt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Sem cartão
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-success" />
                100% online
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-[var(--gradient-primary)] opacity-20 blur-3xl rounded-full" />
            <img
              src={heroImg}
              alt="Aplicação StockSimples a mostrar inventário num tablet e telemóvel"
              width={1280}
              height={896}
              className="relative rounded-2xl shadow-[var(--shadow-elegant)] w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold">Tudo o que precisa, num só lugar</h2>
          <p className="text-muted-foreground mt-2">
            Ferramentas pensadas para quem gere lojas reais, todos os dias.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <FeatureCard
            icon={<Package className="h-5 w-5" />}
            title="Inventário organizado"
            text="Adicione produtos, registe entradas e saídas com um toque."
          />
          <FeatureCard
            icon={<Bell className="h-5 w-5" />}
            title="Alertas críticos"
            text="Saiba exatamente quando um produto está a acabar."
          />
          <FeatureCard
            icon={<BarChart3 className="h-5 w-5" />}
            title="Relatórios no WhatsApp"
            text="Envie o resumo do dia direto ao dono com um clique."
          />
          <FeatureCard
            icon={<TrendingUp className="h-5 w-5" />}
            title="Valor de stock"
            text="Veja em tempo real quanto vale o seu inventário."
          />
          <FeatureCard
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Seguro e privado"
            text="Os seus dados são seus. Acesso protegido por conta."
          />
          <FeatureCard
            icon={<Sparkles className="h-5 w-5" />}
            title="Simples de usar"
            text="Pensado para vendedores, não para programadores."
          />
        </div>
      </section>

      {/* Missão / Visão / Quem somos */}
      <section className="bg-[var(--gradient-subtle)]">
        <div className="mx-auto max-w-6xl px-4 py-16 space-y-12">
          <div className="grid md:grid-cols-3 gap-4">
            <PillarCard
              icon={<Target className="h-5 w-5" />}
              title="Missão"
              text="Tornar a gestão de stock simples e acessível a qualquer pequeno negócio, sem complicações técnicas."
            />
            <PillarCard
              icon={<Eye className="h-5 w-5" />}
              title="Visão"
              text="Ser o parceiro digital de confiança de cada loja de bairro, ajudando-as a crescer com dados claros."
            />
            <PillarCard
              icon={<Users className="h-5 w-5" />}
              title="Valores"
              text="Simplicidade, transparência e proximidade. Construímos a pensar em quem está no balcão todos os dias."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <img
                src={quemSomosImg}
                alt="Lojista a verificar o stock num tablet"
                width={1024}
                height={768}
                loading="lazy"
                className="rounded-2xl shadow-[var(--shadow-card)] w-full h-auto"
              />
            </div>
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">
                <Users className="h-3.5 w-3.5" /> Quem somos
              </span>
              <h2 className="text-2xl md:text-3xl font-bold">
                Feito para lojistas, por quem entende o terreno
              </h2>
              <p className="text-muted-foreground">
                A StockSimples nasceu da experiência real de pequenos comerciantes que
                perdiam vendas por falta de produto, ou tempo a contar caixas no fim do
                dia. Construímos uma ferramenta clara, rápida e que cabe no telemóvel —
                porque é onde o negócio acontece.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <span>Interface pensada para uso diário, sem formação.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <span>Relatórios automáticos para o dono via WhatsApp.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <span>Funciona em qualquer telemóvel, tablet ou computador.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <Card className="p-8 md:p-12 text-center bg-[var(--gradient-primary)] text-primary-foreground border-0 shadow-[var(--shadow-elegant)]">
          <h2 className="text-2xl md:text-3xl font-bold">Comece hoje. É grátis.</h2>
          <p className="mt-2 text-primary-foreground/85 max-w-xl mx-auto">
            Crie a sua conta em menos de um minuto e organize o stock da sua loja já.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="mt-6"
            onClick={() => openAuth("signup")}
          >
            Criar conta grátis
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Card>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">StockSimples</span>
          </div>
          <p>© {new Date().getFullYear()} StockSimples. Todos os direitos reservados.</p>
        </div>
      </footer>

      {/* Auth dialog (controlled outside hero CTA too) */}
      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <img src={logoImg} alt="StockSimples" className="h-9 w-9 rounded-xl object-contain bg-white" />
              Aceder à conta
            </DialogTitle>
            <DialogDescription>
              Entre ou crie a sua conta StockSimples.
            </DialogDescription>
          </DialogHeader>
          <AuthFormsWithDefault
            defaultTab={defaultTab}
            onSuccess={() => setAuthOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <Card className="p-5 hover:shadow-[var(--shadow-elegant)] transition-shadow">
      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{text}</p>
    </Card>
  );
}

function PillarCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <Card className="p-6 bg-card">
      <div className="h-11 w-11 rounded-xl bg-[var(--gradient-primary)] text-primary-foreground flex items-center justify-center mb-3 shadow-[var(--shadow-elegant)]">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{text}</p>
    </Card>
  );
}

function AuthFormsWithDefault({
  defaultTab,
  onSuccess,
}: {
  defaultTab: "login" | "signup";
  onSuccess: () => void;
}) {
  // Re-mount AuthForms when tab changes to apply default
  return <AuthForms key={defaultTab} onSuccess={onSuccess} initialTab={defaultTab} />;
}
