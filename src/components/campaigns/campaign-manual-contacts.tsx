"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  countFilledManualEntries,
  emptyManualSlots,
  manualEntriesToImportedRows,
  MANUAL_CONTACT_SLOTS,
  type ManualContactEntry,
} from "@/lib/manual-contacts";
import { formatDialDisplay } from "@/lib/countries";
import { UserPlus } from "lucide-react";

interface CampaignManualContactsProps {
  dialCode: string;
  onApply: (headers: string[], rows: import("@/types").ImportedRow[], meta: string) => void;
}

export function CampaignManualContacts({
  dialCode,
  onApply,
}: CampaignManualContactsProps) {
  const [slots, setSlots] = useState<ManualContactEntry[]>(emptyManualSlots);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSlots(emptyManualSlots());
    setError(null);
  }, []);

  const updateSlot = (
    index: number,
    field: keyof ManualContactEntry,
    value: string
  ) => {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setError(null);
  };

  const handleApply = () => {
    const filled = countFilledManualEntries(slots);
    if (filled < 1) {
      setError("Saisissez au moins un numéro de téléphone (1 à 4 contacts).");
      return;
    }
    if (filled > MANUAL_CONTACT_SLOTS) {
      setError(`Maximum ${MANUAL_CONTACT_SLOTS} contacts.`);
      return;
    }
    const { headers, rows } = manualEntriesToImportedRows(slots);
    onApply(
      headers,
      rows,
      `${filled} contact(s) saisi(s) manuellement · indicatif ${formatDialDisplay(dialCode)}`
    );
    setError(null);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground leading-relaxed">
        Ajoutez entre <strong>1 et 4</strong> contacts sans fichier Excel. Les
        numéros locaux reçoivent l&apos;indicatif{' '}
        <span className="font-mono text-foreground">
          +{formatDialDisplay(dialCode)}
        </span>
        .
      </p>

      <div className="space-y-3">
        {slots.map((slot, index) => (
          <div
            key={index}
            className="rounded-lg border border-border/50 bg-background/40 p-3 space-y-2"
          >
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Contact {index + 1}
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Nom</Label>
                <Input
                  className="h-9 rounded-lg input-soft"
                  value={slot.nom}
                  onChange={(e) => updateSlot(index, "nom", e.target.value)}
                  placeholder="Dupont"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Prénom</Label>
                <Input
                  className="h-9 rounded-lg input-soft"
                  value={slot.prenom}
                  onChange={(e) => updateSlot(index, "prenom", e.target.value)}
                  placeholder="Marie"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Téléphone {index === 0 ? "*" : ""}
                </Label>
                <Input
                  className="h-9 rounded-lg input-soft font-mono"
                  value={slot.phone}
                  onChange={(e) => updateSlot(index, "phone", e.target.value)}
                  placeholder="06 12 34 56 78"
                  inputMode="tel"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-lg"
        onClick={handleApply}
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Valider les contacts ({countFilledManualEntries(slots)}/{MANUAL_CONTACT_SLOTS})
      </Button>
    </div>
  );
}
