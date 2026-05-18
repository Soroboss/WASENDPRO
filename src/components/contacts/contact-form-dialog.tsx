"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateContact } from "@/lib/inforge";
import { contactToFormFields } from "@/lib/contacts";
import type { Contact } from "@/types";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContactFormDialogProps {
  contact: Contact | null;
  fieldKeys: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function ContactFormDialog({
  contact,
  fieldKeys,
  open,
  onOpenChange,
  onSaved,
}: ContactFormDialogProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [fields, setFields] = useState<{ key: string; value: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!contact || !open) return;
    setName(contact.name ?? "");
    setPhone(contact.phone);
    setFields(contactToFormFields(contact, fieldKeys));
    setError(null);
  }, [contact, open, fieldKeys]);

  const handleSubmit = async () => {
    if (!contact) return;
    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone) {
      setError("Le téléphone est obligatoire.");
      return;
    }

    const custom_data: Record<string, string> = {};
    for (const f of fields) {
      const k = f.key.trim();
      if (k && k.toLowerCase() !== "téléphone" && k.toLowerCase() !== "telephone") {
        custom_data[k] = f.value;
      }
    }

    setLoading(true);
    setError(null);
    try {
      await updateContact(contact.id, {
        name: name.trim() || null,
        phone: cleanPhone,
        custom_data,
      });
      onOpenChange(false);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la mise à jour.");
    } finally {
      setLoading(false);
    }
  };

  if (!contact) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dialog-premium max-h-[90vh] sm:max-w-lg" showCloseButton>
        <DialogHeader className="dialog-premium-header">
          <DialogTitle className="flex items-center gap-3 text-lg">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-neon/25 bg-neon/10">
              <Pencil className="h-5 w-5 text-neon" />
            </span>
            Modifier le contact
          </DialogTitle>
        </DialogHeader>

        <div className="dialog-premium-body space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="section-label">Nom</Label>
              <Input
                className="input-soft h-10"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="section-label">Téléphone</Label>
              <Input
                className="input-soft h-10 font-mono"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="section-label">Variables personnalisées</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-lg"
                onClick={() =>
                  setFields((prev) => [...prev, { key: "", value: "" }])
                }
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Champ
              </Button>
            </div>
            <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
              {fields.map((field, index) => (
                <div key={`${field.key}-${index}`} className="flex gap-2">
                  <Input
                    className="input-soft h-9 w-[38%] text-xs"
                    placeholder="Colonne"
                    value={field.key}
                    onChange={(e) =>
                      setFields((prev) =>
                        prev.map((f, i) =>
                          i === index ? { ...f, key: e.target.value } : f
                        )
                      )
                    }
                  />
                  <Input
                    className="input-soft h-9 flex-1 text-sm"
                    placeholder="Valeur"
                    value={field.value}
                    onChange={(e) =>
                      setFields((prev) =>
                        prev.map((f, i) =>
                          i === index ? { ...f, value: e.target.value } : f
                        )
                      )
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() =>
                      setFields((prev) => prev.filter((_, i) => i !== index))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive rounded-lg bg-destructive/10 px-3 py-2">
              {error}
            </p>
          )}
        </div>

        <div className="dialog-premium-footer">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className={cn("btn-whatsapp rounded-lg min-w-[120px]")}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Enregistrer"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}