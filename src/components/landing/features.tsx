"use client";

import { motion } from "framer-motion";
import {
  FileSpreadsheet,
  Wand2,
  ShieldCheck,
  Cpu,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: FileSpreadsheet,
    title: "Import Excel",
    description:
      "Importez vos listes en un clic. Modèle prêt avec colonnes Nom, Téléphone et Entreprise.",
    tag: "DATA",
  },
  {
    icon: Wand2,
    title: "Variables dynamiques",
    description:
      "Insérez {Nom}, {Entreprise} ou toute colonne. Chaque contact reçoit un message unique.",
    tag: "AI-READY",
  },
  {
    icon: ShieldCheck,
    title: "Envoi sécurisé",
    description:
      "wa.me manuel, un contact à la fois. Anti-doublon : impossible d'envoyer deux fois.",
    tag: "SECURE",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function Features() {
  return (
    <section className="relative py-28 border-t border-white/5">
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
      <motion.div className="container relative mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            className="inline-flex items-center gap-2 text-neon mb-4"
            whileInView={{ opacity: [0.5, 1] }}
            viewport={{ once: true }}
          >
            <Cpu className="h-4 w-4" />
            <span className="font-mono text-[10px] uppercase tracking-[0.25em]">
              Modules actifs
            </span>
          </motion.div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            Stack complète pour le{" "}
            <span className="neon-text">marketing WhatsApp</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Sans API officielle — contrôle total, zéro risque de bannissement
            massif.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto"
        >
          {features.map((f) => (
            <motion.div key={f.title} variants={item}>
              <Card className="card-futurist h-full group border-white/10 bg-card/40">
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <motion.div
                      className="flex h-12 w-12 items-center justify-center rounded-xl border border-neon/20 bg-neon/10 group-hover:shadow-glow transition-shadow duration-500"
                      whileHover={{ scale: 1.05 }}
                    >
                      <f.icon className="h-6 w-6 text-neon" />
                    </motion.div>
                    <span className="font-mono text-[9px] tracking-widest text-cyan-neon/80 border border-cyan-neon/20 rounded px-2 py-0.5">
                      {f.tag}
                    </span>
                  </div>
                  <CardTitle className="text-lg font-display">
                    {f.title}
                  </CardTitle>
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
      </motion.div>
    </section>
  );
}
