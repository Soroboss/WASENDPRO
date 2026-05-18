"use client";

import { useEffect } from "react";
import {
  EXTENSION_IMPORT_EVENT,
  isExtensionImportPayload,
  type ExtensionImportPayload,
} from "@/lib/extension-bridge";

interface ExtensionImportListenerProps {
  onImport: (payload: ExtensionImportPayload) => void;
}

/** Écoute les imports envoyés par l’extension Chrome. */
export function ExtensionImportListener({
  onImport,
}: ExtensionImportListenerProps) {
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (isExtensionImportPayload(detail)) {
        onImport(detail);
      }
    };
    window.addEventListener(EXTENSION_IMPORT_EVENT, handler);
    return () => window.removeEventListener(EXTENSION_IMPORT_EVENT, handler);
  }, [onImport]);

  return null;
}
