"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getCampaigns,
  getContacts,
  isUsingLocalStorage,
} from "@/lib/inforge";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Database,
  Cloud,
} from "lucide-react";

type Status = "loading" | "connected" | "demo" | "error";

export function ConnectionStatus() {
  const [status, setStatus] = useState<Status>("loading");
  const [stats, setStats] = useState({ campaigns: 0, contacts: 0 });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const insforgeUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
  const isDemo = isUsingLocalStorage();

  useEffect(() => {
    async function check() {
      if (isDemo) {
        setStatus("demo");
        return;
      }
      try {
        const [campaigns, contacts] = await Promise.all([
          getCampaigns(),
          getContacts(),
        ]);
        setStats({ campaigns: campaigns.length, contacts: contacts.length });
        setStatus("connected");
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Erreur de connexion");
        setStatus("error");
      }
    }
    check();
  }, [isDemo]);

  if (status === "loading") {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 py-8 justify-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Vérification de la connexion…
        </CardContent>
      </Card>
    );
  }

  if (status === "demo") {
    return (
      <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-5 w-5 text-amber-600" />
            Mode démo (local)
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            Les variables InsForge ne sont pas configurées. Les données sont
            stockées dans le navigateur uniquement.
          </p>
          <p>
            Ajoutez{" "}
            <code className="text-xs bg-muted px-1 rounded">
              NEXT_PUBLIC_INSFORGE_URL
            </code>{" "}
            et{" "}
            <code className="text-xs bg-muted px-1 rounded">
              NEXT_PUBLIC_INSFORGE_ANON_KEY
            </code>{" "}
            sur Vercel, puis redéployez.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (status === "error") {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            Connexion InsForge en échec
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>{errorMsg}</p>
          <p className="mt-2">
            URL configurée :{" "}
            <code className="text-xs">{insforgeUrl ?? "—"}</code>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-whatsapp/30 bg-whatsapp/5">
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-whatsapp" />
            InsForge connecté
          </span>
          <Badge className="bg-whatsapp/15 text-whatsapp-dark border-whatsapp/30">
            Opérationnel
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Cloud className="h-4 w-4 shrink-0" />
          <span>
            Backend :{" "}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
              {insforgeUrl?.replace(/^https?:\/\//, "")}
            </code>
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Database className="h-4 w-4 shrink-0" />
          <span>
            {stats.campaigns} campagne{stats.campaigns !== 1 ? "s" : ""} ·{" "}
            {stats.contacts} contact{stats.contacts !== 1 ? "s" : ""} en base
          </span>
        </div>
        <p className="text-muted-foreground text-xs">
          Déployé sur Vercel — les données sont synchronisées avec PostgreSQL
          InsForge.
        </p>
      </CardContent>
    </Card>
  );
}
