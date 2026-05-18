import Link from "next/link";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { buttonVariants } from "@/components/ui/button";
import { LogoFull } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 inset-x-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-[72px] items-center justify-between px-4">
          <LogoFull href="/" height={44} priority />
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-lg")}
          >
            Tableau de bord
          </Link>
        </div>
      </header>

      <main className="flex-1 pt-[72px]">
        <Hero />
        <Features />
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <LogoFull href="/" height={36} className="mx-auto mb-3 opacity-90" />
        <p>© {new Date().getFullYear()} BISWasend Pro — Campagnes WhatsApp marketing</p>
      </footer>
    </div>
  );
}
