"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Megaphone,
  BookUser,
  Settings,
  MessageCircle,
  ArrowLeft,
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
    label: "Annuaire Global",
    icon: BookUser,
    match: (p: string) => p.startsWith("/dashboard/contacts"),
  },
  {
    href: "/dashboard/settings",
    label: "Paramètres",
    icon: Settings,
    match: (p: string) => p.startsWith("/dashboard/settings"),
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-whatsapp">
          <MessageCircle className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-sm leading-none">WA Send Pro</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Campagnes WhatsApp
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map(({ href, label, icon: Icon, match }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              match(pathname)
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l&apos;accueil
        </Link>
      </div>
    </aside>
  );
}
