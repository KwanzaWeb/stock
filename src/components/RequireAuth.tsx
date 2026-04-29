import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth" });
  }, [loading, user, nav]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--gradient-subtle)]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  return <>{children}</>;
}
