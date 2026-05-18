"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { clearAppSessionCache } from "@/lib/inforge";
import { HardDrive, Loader2 } from "lucide-react";

export function AppCacheCard() {
  const [cleared, setCleared] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleClear = () => {
    setBusy(true);
    try {
      clearAppSessionCache();
      setCleared(true);
      window.setTimeout(() => setCleared(false), 3000);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="card-elevated overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-r from-accent/50 to-transparent">
        <CardTitle className="text-base flex items-center gap-3 font-semibold">
          <HardDrive className="h-5 w-5 text-[hsl(142,70%,38%)]" />
          Performance & cache
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Vide le cache mémoire des listes (contacts, campagnes) et les marqueurs
          de session. Vos contacts et campagnes en base ne sont pas supprimés.
          Utile si l&apos;annuaire semble figé ou après une grosse importation.
        </p>
        <Button
          variant="outline"
          className="rounded-lg"
          onClick={handleClear}
          disabled={busy}
        >
          {busy ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <HardDrive className="h-4 w-4 mr-2" />
          )}
          Vider le cache de l&apos;application
        </Button>
        {cleared && (
          <p className="text-sm text-[hsl(152,76%,32%)]">
            Cache vidé — les prochaines listes seront rechargées à jour.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
