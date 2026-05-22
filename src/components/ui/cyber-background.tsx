"use client";

import { cn } from "@/lib/utils";

interface CyberBackgroundProps {
  className?: string;
  intensity?: "low" | "medium";
}

export function CyberBackground({
  className,
  intensity = "low",
}: CyberBackgroundProps) {
  const orbOpacity = intensity === "low" ? 0.28 : 0.45;

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden",
        className
      )}
      aria-hidden
    >
      <div
        className="absolute -top-32 left-1/2 h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-neon/20 blur-[120px] cyber-orb-pulse"
        style={{ opacity: orbOpacity }}
      />
      <div
        className="absolute bottom-0 right-0 h-[380px] w-[380px] rounded-full bg-cyan-neon/12 blur-[100px]"
        style={{ opacity: orbOpacity * 0.85 }}
      />
      <div className="absolute inset-0 cyber-grid opacity-[0.35]" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/80" />
    </div>
  );
}
