"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  COUNTRIES,
  formatDialDisplay,
  getCountryByDial,
} from "@/lib/countries";
import { useCountryDial } from "@/hooks/use-country-dial";
import { Globe } from "lucide-react";

interface CountrySelectorProps {
  compact?: boolean;
  showHint?: boolean;
}

export function CountrySelector({
  compact = false,
  showHint = true,
}: CountrySelectorProps) {
  const { dialCode, setCountryDial } = useCountryDial();
  const selected = getCountryByDial(dialCode);

  return (
    <div className={compact ? "space-y-1.5" : "space-y-2"}>
      <Label className="section-label flex items-center gap-2">
        <Globe className="h-3.5 w-3.5 text-neon" />
        Pays / indicatif téléphonique
      </Label>
      <Select
        value={dialCode}
        onValueChange={(v) => {
          if (v) setCountryDial(v);
        }}
      >
        <SelectTrigger
          className={compact ? "h-9 text-sm" : "h-10 input-soft"}
        >
          <SelectValue placeholder="Choisir un pays">
            {selected
              ? `${selected.flag} ${selected.name} (${formatDialDisplay(selected.dialCode)})`
              : formatDialDisplay(dialCode)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[280px]">
          {COUNTRIES.map((c) => (
            <SelectItem key={c.iso} value={c.dialCode}>
              <span className="flex items-center gap-2">
                <span>{c.flag}</span>
                <span>{c.name}</span>
                <span className="text-muted-foreground font-mono text-xs">
                  {formatDialDisplay(c.dialCode)}
                </span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {showHint && (
        <p className="text-xs text-muted-foreground leading-relaxed">
          Les numéros locaux (ex. 06… ou 77…) seront convertis en format
          international avec l&apos;indicatif{" "}
          <strong className="font-mono text-foreground">
            {formatDialDisplay(dialCode)}
          </strong>
          .
        </p>
      )}
    </div>
  );
}
