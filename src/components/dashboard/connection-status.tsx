"use client";

import { useEffect, useState } from "react";
import { getCampaigns, isUsingLocalStorage } from "@/lib/inforge";
import { AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "loading" | "connected" | "demo" | "error";

export function ConnectionStatus() {
  const [status, setStatus] = useState<Status>("loading");
  const isDemo = isUsingLocalStorage();

  useEffect(() => {
    async function check() {
      if (isDemo) {
        setStatus("demo");
        return;
      }
      try {
        await getCampaigns();
        setStatus("connected");
      } catch {
        setStatus("error");
      }
    }
    check();
  }, [isDemo]);

  if (status === "loading" || status === "connected") {
    return null;
  }

  const configs = {
    demo: {
      pill: "status-pill-demo",
      icon: AlertTriangle,
      title: "Mode hors ligne",
      text: "Vos données sont enregistrées uniquement sur cet appareil.",
    },
    error: {
      pill: "status-pill-error",
      icon: XCircle,
      title: "Chargement impossible",
      text: "Impossible d'accéder à vos campagnes. Réessayez dans quelques instants.",
    },
  };

  const cfg = configs[status as keyof typeof configs];
  if (!cfg) return null;

  const Icon = cfg.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl px-4 py-3.5 text-sm animate-in fade-in slide-in-from-bottom-2 duration-300",
        cfg.pill
      )}
    >
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="font-medium">{cfg.title}</p>
        <p className="mt-0.5 opacity-80 text-xs leading-relaxed">{cfg.text}</p>
      </div>
    </div>
  );
}
