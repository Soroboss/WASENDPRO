"use client";

import { parseWhatsAppFormatting } from "@/lib/whatsapp-format";
import { cn } from "@/lib/utils";

interface WhatsAppMessagePreviewProps {
  text: string;
  className?: string;
  compact?: boolean;
  label?: string;
}

function FormatSpan({
  type,
  children,
}: {
  type: string;
  children: string;
}) {
  switch (type) {
    case "bold":
      return <strong className="font-semibold">{children}</strong>;
    case "italic":
      return <em>{children}</em>;
    case "strike":
      return <s>{children}</s>;
    case "code":
      return (
        <code className="rounded bg-black/25 px-1 py-0.5 font-mono text-[0.85em]">
          {children}
        </code>
      );
    default:
      return <>{children}</>;
  }
}

/** Aperçu bulle WhatsApp avec mise en forme (*gras*, etc.). */
export function WhatsAppMessagePreview({
  text,
  className,
  compact = false,
  label = "Aperçu WhatsApp",
}: WhatsAppMessagePreviewProps) {
  if (!text.trim()) return null;

  const parts = parseWhatsAppFormatting(text);

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <p className="text-xs text-muted-foreground section-label">{label}</p>
      )}
      <div
        className={cn(
          "flex justify-start",
          compact ? "max-w-full" : "max-w-md"
        )}
      >
        <div
          className={cn(
            "rounded-2xl rounded-tl-md text-left shadow-md",
            "bg-[#005c4b] text-[#e9edef]",
            compact ? "px-2.5 py-2 text-xs" : "px-3.5 py-2.5 text-sm"
          )}
        >
          <div
            className={cn(
              "whitespace-pre-wrap break-words leading-relaxed",
              "text-left [text-align:left]"
            )}
          >
            {parts.map((part, i) => (
              <FormatSpan key={i} type={part.type}>
                {part.text}
              </FormatSpan>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
