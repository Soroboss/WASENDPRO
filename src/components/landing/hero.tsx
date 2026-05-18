"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { CyberBackground } from "@/components/ui/cyber-background";
import { cn } from "@/lib/utils";
import { LogoFull } from "@/components/brand/logo";
import { APP_NAME } from "@/lib/brand";
import {
  ArrowRight,
  MessageCircle,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";

const stats = [
  { label: "Envoi", value: "wa.me" },
  { label: "Sync", value: "Cloud" },
  { label: "Sécurité", value: "Anti×2" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-36">
      <CyberBackground />

      <motion.div
        className="absolute left-1/2 top-32 -translate-x-1/2 w-[min(100%,640px)] opacity-30 pointer-events-none"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="glass-panel rounded-2xl p-6 font-mono text-xs text-muted-foreground space-y-2">
          <p className="text-neon">{">"} init campaign_module</p>
          <p>{">"} load contacts.xlsx — 1 247 rows</p>
          <p>{">"} compile {"{Nom}"}, {"{Entreprise}"}</p>
          <p className="text-cyan-neon">{">"} ready — 0 duplicates</p>
        </div>
      </motion.div>

      <motion.div className="container relative mx-auto px-4 text-center max-w-4xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-8"
        >
          <LogoFull
            height={140}
            priority
            className="drop-shadow-[0_0_40px_hsl(158_96%_48%_/_0.25)] mx-auto"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-neon/30 bg-neon/5 backdrop-blur-md px-4 py-1.5 text-sm mb-8 shadow-glow"
        >
          <Sparkles className="h-4 w-4 text-neon animate-pulse-glow" />
          <span className="font-mono text-xs uppercase tracking-widest text-neon">
            {APP_NAME}
          </span>
          <span className="h-1 w-1 rounded-full bg-neon/60" />
          <span className="text-muted-foreground text-xs">v2.0</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]"
        >
          Campagnes{" "}
          <span className="neon-text">WhatsApp</span>
          <br />
          <span className="text-foreground/90">du futur</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-balance"
        >
          Import Excel, variables dynamiques, envoi sécurisé via wa.me et
          synchronisation cloud InsForge — sans API officielle.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({ size: "lg" }),
              "btn-whatsapp h-12 px-8 text-base inline-flex items-center rounded-xl font-medium"
            )}
          >
            Lancer le cockpit
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mt-14 grid grid-cols-3 gap-3 max-w-md mx-auto"
        >
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.08 }}
              className="glass-panel rounded-lg px-3 py-3 text-center"
            >
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {s.label}
              </p>
              <p className="font-mono text-sm font-semibold text-neon mt-0.5">
                {s.value}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
        >
          <span className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-neon" />
            Liens wa.me directs
          </span>
          <span className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-cyan-neon" />
            Anti-doublon
          </span>
          <span className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-neon" />
            Sync cloud
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}
