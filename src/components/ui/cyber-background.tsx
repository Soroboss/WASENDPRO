"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CyberBackgroundProps {
  className?: string;
  intensity?: "low" | "medium";
}

export function CyberBackground({
  className,
  intensity = "medium",
}: CyberBackgroundProps) {
  const orbOpacity = intensity === "low" ? 0.35 : 0.55;

  return (
    <motion.div
      className={cn("pointer-events-none fixed inset-0 -z-10 overflow-hidden", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      aria-hidden
    >
      <motion.div
        className="absolute -top-32 left-1/2 h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-neon/20 blur-[120px]"
        animate={{ scale: [1, 1.08, 1], opacity: [orbOpacity, orbOpacity * 0.7, orbOpacity] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 h-[380px] w-[380px] rounded-full bg-cyan-neon/15 blur-[100px]"
        animate={{ x: [0, -24, 0], y: [0, 16, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -left-24 h-[280px] w-[280px] rounded-full bg-neon/10 blur-[80px]"
        animate={{ x: [0, 32, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-0 cyber-grid opacity-[0.4]"
        animate={{ backgroundPosition: ["0px 0px", "0px 48px"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/80" />
    </motion.div>
  );
}
