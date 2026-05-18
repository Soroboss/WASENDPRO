"use client";

import { motion } from "framer-motion";
import { BookUser, FolderKanban, UserCheck, UserX } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContactsStatsProps {
  totalContacts: number;
  campaignCount: number;
  withName: number;
  withoutName: number;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export function ContactsStats({
  totalContacts,
  campaignCount,
  withName,
  withoutName,
}: ContactsStatsProps) {
  const stats = [
    {
      label: "Contacts",
      value: totalContacts,
      icon: BookUser,
      accent: "text-neon",
    },
    {
      label: "Campagnes",
      value: campaignCount,
      icon: FolderKanban,
      accent: "text-cyan-neon",
    },
    {
      label: "Avec nom",
      value: withName,
      icon: UserCheck,
      accent: "text-[hsl(152,76%,45%)]",
    },
    {
      label: "Sans nom",
      value: withoutName,
      icon: UserX,
      accent: "text-muted-foreground",
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          variants={item}
          className="glass-panel group relative overflow-hidden rounded-xl border border-white/5 p-4"
        >
          <motion.div className="absolute inset-0 bg-gradient-to-br from-neon/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <motion.div className="absolute -right-4 -top-4 h-14 w-14 rounded-full bg-neon/10 blur-2xl" />
          <motion.div className="relative flex items-start justify-between gap-2">
            <motion.div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">
                {stat.value}
              </p>
            </motion.div>
            <motion.span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5",
                stat.accent
              )}
            >
              <stat.icon className="h-4 w-4" />
            </motion.span>
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  );
}
