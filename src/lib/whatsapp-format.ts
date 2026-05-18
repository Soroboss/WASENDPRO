export type WhatsAppFormatType = "text" | "bold" | "italic" | "strike" | "code";

export interface WhatsAppFormattedPart {
  type: WhatsAppFormatType;
  text: string;
}

const FORMAT_RULES: { type: WhatsAppFormatType; regex: RegExp }[] = [
  { type: "code", regex: /```([^`]+)```/ },
  { type: "bold", regex: /\*([^*\n]+)\*/ },
  { type: "italic", regex: /_([^_\n]+)_/ },
  { type: "strike", regex: /~([^~\n]+)~/ },
];

/** Découpe le texte selon la syntaxe WhatsApp (*gras*, _italique_, etc.). */
export function parseWhatsAppFormatting(text: string): WhatsAppFormattedPart[] {
  const parts: WhatsAppFormattedPart[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    let best: {
      index: number;
      length: number;
      type: WhatsAppFormatType;
      inner: string;
    } | null = null;

    for (const { type, regex } of FORMAT_RULES) {
      const match = regex.exec(remaining);
      if (!match || match.index === undefined) continue;
      if (!best || match.index < best.index) {
        best = {
          index: match.index,
          length: match[0].length,
          type,
          inner: match[1],
        };
      }
    }

    if (!best) {
      parts.push({ type: "text", text: remaining });
      break;
    }

    if (best.index > 0) {
      parts.push({ type: "text", text: remaining.slice(0, best.index) });
    }
    parts.push({ type: best.type, text: best.inner });
    remaining = remaining.slice(best.index + best.length);
  }

  return parts.length > 0 ? parts : [{ type: "text", text }];
}

export type FormatWrapper = "bold" | "italic" | "strike" | "code";

const WRAPPERS: Record<FormatWrapper, { open: string; close: string }> = {
  bold: { open: "*", close: "*" },
  italic: { open: "_", close: "_" },
  strike: { open: "~", close: "~" },
  code: { open: "```", close: "```" },
};

/** Entoure la sélection avec les marqueurs WhatsApp. */
export function wrapWithWhatsAppFormat(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  format: FormatWrapper
): { newValue: string; newCursor: number } {
  const { open, close } = WRAPPERS[format];
  const selected = value.slice(selectionStart, selectionEnd);

  if (selected) {
    const wrapped = `${open}${selected}${close}`;
    const newValue =
      value.slice(0, selectionStart) + wrapped + value.slice(selectionEnd);
    return { newValue, newCursor: selectionStart + wrapped.length };
  }

  const wrapped = `${open}${close}`;
  const newValue =
    value.slice(0, selectionStart) + wrapped + value.slice(selectionStart);
  const newCursor = selectionStart + open.length;
  return { newValue, newCursor };
}
