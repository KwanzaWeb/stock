import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Save, Phone } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/definicoes")({
  head: () => ({
    meta: [
      { title: "Definições — StockSimples" },
      { name: "description", content: "Configurações da aplicação." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <AppShell>
        <Definicoes />
      </AppShell>
    </RequireAuth>
  ),
});

const KEY_PREFIX = "stocksimples:owner_phone:";

export function getOwnerPhone(userId: string): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(KEY_PREFIX + userId) ?? "";
}

function Definicoes() {
  const { user } = useAuth();
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (user) setPhone(getOwnerPhone(user.id));
  }, [user]);

  const handleSave = () => {
    if (!user) return;
    const cleaned = phone.trim();
    if (cleaned && !/^\+?\d{8,20}$/.test(cleaned.replace(/\s/g, ""))) {
      toast.error("Número inválido. Use formato +244912345678");
      return;
    }
    localStorage.setItem(KEY_PREFIX + user.id, cleaned);
    toast.success("Definições guardadas");
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Definições</h2>
        <p className="text-sm text-muted-foreground">Configure a sua loja</p>
      </div>

      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Phone className="h-4 w-4" />
          </div>
          <h3 className="font-semibold text-sm">WhatsApp do dono da loja</h3>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="owner_phone">Número (com indicativo do país)</Label>
          <Input
            id="owner_phone"
            type="tel"
            placeholder="+244912345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={30}
          />
          <p className="text-[11px] text-muted-foreground">
            Os relatórios diários serão enviados para este número via WhatsApp.
          </p>
        </div>

        <Button onClick={handleSave} className="w-full">
          <Save className="h-4 w-4 mr-2" /> Guardar
        </Button>
      </Card>
    </div>
  );
}
