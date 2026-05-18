"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CountrySelector } from "@/components/settings/country-selector";
import { Globe } from "lucide-react";

export function CountrySettingsCard() {
  return (
    <Card className="card-elevated border-neon/15">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 font-semibold">
          <Globe className="h-5 w-5 text-neon" />
          Pays par défaut
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CountrySelector />
      </CardContent>
    </Card>
  );
}
