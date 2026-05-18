import Link from "next/link";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { buttonVariants } from "@/components/ui/button";
import { LogoFull } from "@/components/brand/logo";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-background/60 backdrop-blur-xl">
        <div className="container mx-auto flex h-[72px] items-center justify-between px-4">
          <LogoFull href="/" height={48} priority />
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "btn-neon-outline rounded-lg border-neon/30"
            )}
          >
            Cockpit
          </Link>
        </div>
      </header>

      <main className="flex-1 pt-[72px]">
        <Hero />
        <Features />
      </main>

      <footer className="border-t border-white/10 py-10 text-center text-sm text-muted-foreground relative">
        <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
        <LogoFull href="/" height={40} className="mx-auto mb-3 opacity-80" />
        <p className="font-mono text-xs">
          © {new Date().getFullYear()} {APP_NAME} — {APP_TAGLINE}
        </p>
      </footer>
    </div>
  );
}
