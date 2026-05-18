"use client";

import { motion } from "framer-motion";
import { Megaphone, Users, Zap, Cloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { isUsingLocalStorage } from "@/lib/inforge";

interface DashboardStatsProps {
  campaignCount: number;
  contactCount: number;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function DashboardStats({
  campaignCount,
  contactCount,
}: DashboardStatsProps) {
  const isCloud = !isUsingLocalStorage();

  const stats = [
    {
      label: "Campagnes",
      value: campaignCount,
      icon: Megaphone,
      accent: "text-neon",
    },
    {
      label: "Contacts",
      value: contactCount,
      icon: Users,
      accent: "text-cyan-neon",
    },
    {
      label: "Mode",
      value: isCloud ? "Cloud" : "Local",
      icon: isCloud ? Cloud : Zap,
      accent: isCloud ? "text-neon" : "text-amber-400",
      sub: isCloud ? "InsForge sync" : "Hors ligne",
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid gap-3 sm:grid-cols-3"
    >
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          variants={item}
          className="glass-panel group relative overflow-hidden rounded-xl p-4"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-neon/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />
          <motion.div
            className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-neon/10 blur-2xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className={cn(
              "relative flex items-start justify-between gap-2"
            )}
          >
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-foreground">
                {stat.value}
              </p>
              {stat.sub && (
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {stat.sub}
                </p>
              )}
            </div>
            <motion.span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5",
                stat.accent
              )}
              whileHover={{ scale: 1.05 }}
            >
              <stat.icon className="h-4 w-4" />
            </motion.span>
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  );
}
