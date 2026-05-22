"use client";

import { BookUser, FolderKanban, UserCheck, UserX } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContactsStatsProps {
  totalContacts: number;
  campaignCount: number;
  withName: number;
  withoutName: number;
}

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
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="glass-panel group relative overflow-hidden rounded-xl border border-white/5 p-4"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-neon/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">
                {stat.value}
              </p>
            </div>
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5",
                stat.accent
              )}
            >
              <stat.icon className="h-4 w-4" />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
