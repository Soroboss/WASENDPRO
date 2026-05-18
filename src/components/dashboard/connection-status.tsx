"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  getCampaigns,
  getContacts,
  isUsingLocalStorage,
} from "@/lib/inforge";
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
        await Promise.all([getCampaigns(), getContacts()]);
        setStatus("connected");
      } catch {
        setStatus("error");
      }
    }
    check();
  }, [isDemo]);

  // En production : rien si tout va bien — pas de bandeau technique pour l'utilisateur.
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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex items-start gap-3 rounded-xl px-4 py-3.5 text-sm", cfg.pill)}
    >
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="font-medium">{cfg.title}</p>
        <p className="mt-0.5 opacity-80 text-xs leading-relaxed">{cfg.text}</p>
      </div>
    </motion.div>
  );
}
