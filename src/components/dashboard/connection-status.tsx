"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  getCampaigns,
  getContacts,
  isUsingLocalStorage,
} from "@/lib/inforge";
import { AlertTriangle, XCircle } from "lucide-react";

type Status = "loading" | "connected" | "demo" | "error";

/** Affiche un bandeau uniquement en cas de problème — rien quand tout fonctionne. */
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

  if (status === "loading" || status === "connected") {
    return null;
  }

  if (status === "demo") {
    return (
      <Card className="border-amber-200/80 bg-amber-50/80 dark:bg-amber-950/30">
        <CardContent className="flex items-start gap-3 py-4 text-sm text-amber-900 dark:text-amber-100">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <p>
            Les données sont enregistrées uniquement sur cet appareil. Pour une
            synchronisation cloud, contactez votre administrateur.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardContent className="flex items-start gap-3 py-4 text-sm">
        <XCircle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
        <div>
          <p className="font-medium text-destructive">
            Connexion au serveur impossible
          </p>
          <p className="text-muted-foreground mt-1">{errorMsg}</p>
        </div>
      </CardContent>
    </Card>
  );
}
