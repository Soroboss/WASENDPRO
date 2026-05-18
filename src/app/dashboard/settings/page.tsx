import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Settings,
  FileSpreadsheet,
  MessageSquare,
  Shield,
  ExternalLink,
} from "lucide-react";

const instructions = [
  {
    icon: FileSpreadsheet,
    title: "1. Préparer vos contacts",
    steps: [
      "Téléchargez le modèle Excel depuis le formulaire de nouvelle campagne.",
      "Remplissez les colonnes : Nom, Téléphone, Entreprise (ou vos propres colonnes).",
      "Les numéros doivent être au format international sans le + (ex: 33612345678).",
    ],
  },
  {
    icon: MessageSquare,
    title: "2. Rédiger le message",
    steps: [
      "Importez votre fichier Excel — les colonnes deviennent des variables {Nom}, etc.",
      "Cliquez sur une variable pour l'insérer, ou surlignez du texte puis cliquez pour remplacer.",
      "Utilisez le menu déroulant « Insérer variable » comme alternative.",
    ],
  },
  {
    icon: Shield,
    title: "3. Envoyer en sécurité",
    steps: [
      "Ouvrez la campagne et cliquez « Envoyer » contact par contact.",
      "WhatsApp s'ouvre via wa.me avec le message pré-rempli.",
      "Une fois envoyé, le bouton est grisé — impossible d'envoyer deux fois (anti-doublon).",
      "Exportez le rapport Excel à tout moment pour suivre les statuts.",
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Paramètres & Instructions
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Guide d&apos;utilisation et configuration InsForge
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configuration InsForge</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Pour connecter la base de données PostgreSQL, ajoutez dans{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
              .env.local
            </code>{" "}
            :
          </p>
          <pre className="bg-muted rounded-lg p-4 text-xs font-mono overflow-x-auto">
{`NEXT_PUBLIC_INSFORGE_URL=https://votre-app.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=votre_cle_anon`}
          </pre>
          <p>
            Schéma SQL requis : tables{" "}
            <code className="text-xs">contacts</code>,{" "}
            <code className="text-xs">campaigns</code>,{" "}
            <code className="text-xs">campaign_logs</code>. Voir{" "}
            <code className="text-xs">supabase/schema.sql</code> dans le projet.
          </p>
          <a
            href="https://insforge.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-whatsapp hover:underline"
          >
            Documentation InsForge
            <ExternalLink className="h-3 w-3" />
          </a>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {instructions.map((section) => (
          <Card key={section.title}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <section.icon className="h-5 w-5 text-whatsapp" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                {section.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
