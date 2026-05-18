import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectionStatus } from "@/components/dashboard/connection-status";
import { CountrySettingsCard } from "@/components/settings/country-settings-card";
import { PageHeader } from "@/components/ui/page-header";
import {
  BookOpen,
  FileSpreadsheet,
  MessageSquare,
  Shield,
} from "lucide-react";

const instructions = [
  {
    icon: FileSpreadsheet,
    title: "Préparer vos contacts",
    steps: [
      "Téléchargez le modèle Excel (Nom, Prénom, Téléphone, Entreprise, Ville, Email, Offre…).",
      "Ajoutez vos propres colonnes — chaque colonne devient une variable {Nom}, {Ville}, etc.",
      "Choisissez votre pays dans Paramètres — l'indicatif est ajouté aux numéros locaux (06…, 77…).",
    ],
  },
  {
    icon: MessageSquare,
    title: "Rédiger le message",
    steps: [
      "Importez votre fichier Excel — les colonnes deviennent des variables {Nom}, etc.",
      "Mettez en *gras*, _italique_ ou ~barré~ avec la barre d'outils (syntaxe WhatsApp).",
      "L'aperçu bulle verte montre le message aligné avant chaque envoi.",
    ],
  },
  {
    icon: Shield,
    title: "Envoyer en sécurité",
    steps: [
      "Ajoutez des pièces jointes (JPEG, PDF, PPT, audio) à la création si besoin.",
      "Ouvrez la campagne et cliquez « Envoyer » contact par contact.",
      "Avec pièces jointes : WhatsApp Web s'ouvre et l'extension les ajoute.",
      "Une fois envoyé, le bouton est grisé — impossible d'envoyer deux fois (anti-doublon).",
      "Exportez le rapport Excel à tout moment pour suivre les statuts.",
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Guide d'utilisation"
        description="Tout ce qu'il faut savoir pour lancer vos campagnes"
        icon={BookOpen}
      />

      <ConnectionStatus />

      <CountrySettingsCard />

      <div className="grid gap-4">
        {instructions.map((section, index) => (
          <Card key={section.title} className="card-elevated overflow-hidden">
            <CardHeader className="pb-3 bg-gradient-to-r from-accent/50 to-transparent">
              <CardTitle className="text-base flex items-center gap-3 font-semibold">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-background shadow-sm text-sm font-bold text-[hsl(142,70%,38%)]">
                  {index + 1}
                </span>
                <section.icon className="h-5 w-5 text-[hsl(142,70%,38%)]" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <ol className="space-y-3">
                {section.steps.map((step, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-sm text-muted-foreground leading-relaxed"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-foreground">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
