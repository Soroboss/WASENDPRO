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
    <aside className="flex h-full w-[260px] flex-col border-r border-sidebar-border bg-sidebar shadow-soft">
      <div className="flex h-[72px] items-center gap-3 border-b border-sidebar-border px-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-whatsapp to-whatsapp-dark shadow-glow">
          <MessageCircle className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-semibold text-sm leading-tight tracking-tight">
            WA Send Pro
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Campagnes WhatsApp
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4",
                  active && "text-[hsl(142,70%,40%)]"
                )}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Accueil
        </Link>
      </div>
    </aside>
  );
}
