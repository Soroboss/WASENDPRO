"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LogoFull } from "@/components/brand/logo";
import {
  Megaphone,
  BookUser,
  Settings,
  ArrowLeft,
  Radio,
} from "lucide-react";

const navItems = [
  {
    href: "/dashboard",
    label: "Campagnes",
    icon: Megaphone,
    match: (p: string) =>
      p === "/dashboard" || p.startsWith("/dashboard/campaigns"),
  },
  {
    href: "/dashboard/contacts",
    label: "Annuaire",
    icon: BookUser,
    match: (p: string) => p.startsWith("/dashboard/contacts"),
  },
  {
    href: "/dashboard/settings",
    label: "Guide",
    icon: Settings,
    match: (p: string) => p.startsWith("/dashboard/settings"),
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="relative flex h-full w-[260px] flex-col border-r border-white/10 bg-sidebar/95 backdrop-blur-xl">
      <motion.div className="absolute inset-0 cyber-grid opacity-[0.15] pointer-events-none" aria-hidden />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon/50 to-transparent" />

      <div className="relative flex min-h-[88px] items-center justify-center border-b border-white/10 px-4 py-4">
        <LogoFull href="/dashboard" height={64} />
      </div>

      <div className="relative flex items-center gap-2 px-4 py-2 mx-3 mt-3 rounded-lg border border-neon/20 bg-neon/5">
        <Radio className="h-3 w-3 text-neon animate-pulse" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-neon/90">
          Système actif
        </span>
      </div>

      <nav className="relative flex-1 space-y-1 p-3 mt-2">
        {navItems.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link key={href} href={href} className="block">
              <motion.span
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-neon/10 text-neon border border-neon/25 shadow-glow"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent"
                )}
                whileHover={{ x: active ? 0 : 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className={cn("h-4 w-4", active && "text-neon")} />
                {label}
              </motion.span>
            </Link>
          );
        })}
      </nav>

      <div className="relative border-t border-white/10 p-3">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Accueil
        </Link>
      </div>
    </aside>
  );
}
