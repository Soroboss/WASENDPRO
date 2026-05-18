"use client";

import { motion } from "framer-motion";
import {
  FileSpreadsheet,
  Wand2,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: FileSpreadsheet,
    title: "Import Excel",
    description:
      "Importez vos listes de contacts en un clic. Téléchargez notre modèle prêt à l'emploi avec les colonnes Nom, Téléphone et Entreprise.",
  },
  {
    icon: Wand2,
    title: "Personnalisation dynamique",
    description:
      "Insérez des variables {Nom}, {Entreprise} ou toute colonne Excel. Chaque contact reçoit un message unique et personnalisé.",
  },
  {
    icon: ShieldCheck,
    title: "Envoi sécurisé anti-bannissement",
    description:
      "Envoi manuel via wa.me, un contact à la fois. Système anti-doublon : un contact ne peut être marqué envoyé qu'une seule fois par campagne.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function Features() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Tout ce dont vous avez besoin
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Une solution complète pour gérer vos campagnes marketing WhatsApp
            sans API officielle.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {features.map((f) => (
            <motion.div key={f.title} variants={item}>
              <Card className="h-full border-0 shadow-md hover:shadow-lg transition-shadow bg-background">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-whatsapp/10 mb-2">
                    <f.icon className="h-6 w-6 text-whatsapp" />
                  </div>
                  <CardTitle className="text-lg">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {f.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
