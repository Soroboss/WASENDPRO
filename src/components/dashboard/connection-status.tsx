"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  getCampaigns,
  getContacts,
  isUsingLocalStorage,
} from "@/lib/inforge";
import { AlertTriangle, CheckCircle2, XCircle, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "loading" | "connected" | "demo" | "error";

export function ConnectionStatus() {
  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
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
      } catch (err) {
        setErrorMsg(
          err instanceof Error ? err.message : "Impossible de charger les données."
        );
        setStatus("error");
      }
    }
    check();
  }, [isDemo]);

  if (status === "loading") {
    return (
      <motion.div
        className="h-12 rounded-xl border border-white/10 bg-card/40 animate-pulse"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />
    );
  }

  const configs = {
    connected: {
      pill: "status-pill-connected",
      icon: CheckCircle2,
      title: "InsForge connecté",
      text: "Campagnes et contacts synchronisés dans le cloud.",
    },
    demo: {
      pill: "status-pill-demo",
      icon: AlertTriangle,
      title: "Mode local",
      text: "Données sur cet appareil uniquement. Configurez InsForge pour le cloud.",
    },
    error: {
      pill: "status-pill-error",
      icon: XCircle,
      title: "Connexion impossible",
      text: errorMsg,
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
        <p className="font-medium flex items-center gap-2">
          {cfg.title}
          {status === "connected" && (
            <Wifi className="h-3.5 w-3.5 opacity-70" />
          )}
        </p>
        <p className="mt-0.5 opacity-80 text-xs leading-relaxed">{cfg.text}</p>
      </div>
    </motion.div>
  );
}
