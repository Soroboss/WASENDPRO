import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "BISWasend Pro — Campagnes WhatsApp Marketing",
  description:
    "Gérez vos campagnes marketing WhatsApp avec import Excel, variables dynamiques et envoi sécurisé via wa.me.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={cn("font-sans", inter.variable)}>
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
