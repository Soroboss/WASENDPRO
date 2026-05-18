"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { compileMessage } from "@/lib/message";
import { WhatsAppMessagePreview } from "@/components/campaigns/whatsapp-message-preview";
import { openWhatsApp } from "@/lib/whatsapp";
import { queueWhatsAppAttachments } from "@/lib/whatsapp-bridge";
import { formatFileSize, getAttachmentKind } from "@/lib/attachments";
import { exportCampaignReport } from "@/lib/excel";
import {
  getCampaign,
  getCampaignLogs,
  markContactAsSent,
} from "@/lib/inforge";
import type { Campaign, CampaignLog, Contact } from "@/types";
import {
  Send,
  FileDown,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquare,
  ArrowLeft,
  Megaphone,
  Paperclip,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface LogWithContact extends CampaignLog {
  contact: Contact;
}

interface CampaignRunnerProps {
  campaignId: string;
}

export function CampaignRunner({ campaignId }: CampaignRunnerProps) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [logs, setLogs] = useState<LogWithContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, l] = await Promise.all([
        getCampaign(campaignId),
        getCampaignLogs(campaignId),
      ]);
      setCampaign(c);
      setLogs(l as LogWithContact[]);
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    load();
  }, [load]);

  const getRowData = (log: LogWithContact): Record<string, string> => {
    if (log.row_data && Object.keys(log.row_data).length > 0) {
      return log.row_data;
    }
    return log.contact.custom_data ?? {};
  };

  const handleSend = (log: LogWithContact) => {
    if (!campaign || log.status === "sent") return;
    const rowData = getRowData(log);
    const compiled = compileMessage(campaign.template_message, rowData);
    const phone = log.contact.phone;
    const attachments = campaign.attachments ?? [];
    const hasAttachments = attachments.length > 0;

    const opened = openWhatsApp(phone, compiled, { useWeb: hasAttachments });
    if (!opened) {
      alert("Numéro de téléphone invalide pour ce contact.");
      return;
    }

    setSendingId(log.contact_id);

    void (async () => {
      try {
        if (hasAttachments) {
          await queueWhatsAppAttachments(phone, compiled, attachments);
        }
        await markContactAsSent(campaign.id, log.contact_id);
        setLogs((prev) =>
          prev.map((l) =>
            l.contact_id === log.contact_id
              ? {
                  ...l,
                  status: "sent" as const,
                  sent_at: new Date().toISOString(),
                }
              : l
          )
        );
      } catch (err) {
        alert(
          err instanceof Error
            ? err.message
            : "Impossible de marquer le contact comme envoyé."
        );
      } finally {
        setSendingId(null);
      }
    })();
  };

  const handleExport = () => {
    if (!campaign) return;
    const report = logs.map((log) => {
      const rowData = getRowData(log);
      const compiled = compileMessage(campaign.template_message, rowData);
      return {
        name: log.contact.name ?? rowData["Nom"] ?? "—",
        phone: log.contact.phone,
        message: compiled,
        status:
          log.status === "sent"
            ? "Envoyé"
            : log.status === "failed"
              ? "Échoué"
              : "En attente",
        sentAt: log.sent_at
          ? format(new Date(log.sent_at), "dd/MM/yyyy HH:mm", { locale: fr })
          : "—",
      };
    });
    exportCampaignReport(
      report,
      `rapport_${campaign.name.replace(/\s+/g, "_")}.xlsx`
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-9 w-9 animate-spin text-muted-foreground/60" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <p className="text-muted-foreground text-center py-24">
        Campagne introuvable.
      </p>
    );
  }

  const sentCount = logs.filter((l) => l.status === "sent").length;
  const progress = logs.length > 0 ? Math.round((sentCount / logs.length) * 100) : 0;

  return (
    <div className="space-y-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors -mb-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux campagnes
      </Link>

      <PageHeader
        title={campaign.name}
        icon={Megaphone}
        description={
          <>
            {sentCount}/{logs.length} envoyés · {logs.length} contact
            {logs.length > 1 ? "s" : ""} dans la campagne
            {campaign.scheduled_date && (
              <>
                {" "}
                · Programmée le{" "}
                {format(new Date(campaign.scheduled_date), "dd MMM yyyy HH:mm", {
                  locale: fr,
                })}
              </>
            )}
          </>
        }
        action={
          <Button variant="outline" className="rounded-xl" onClick={handleExport}>
            <FileDown className="h-4 w-4 mr-2" />
            Exporter le rapport
          </Button>
        }
      />

      <div className="glass-panel rounded-xl p-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="section-label">Progression</span>
          <span className="font-mono font-semibold text-neon">{progress}%</span>
        </div>
        <div className="progress-neon">
          <div
            className="progress-neon-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {(campaign.attachments?.length ?? 0) > 0 && (
        <Card className="card-elevated border-neon/15">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-neon" />
              Pièces jointes ({campaign.attachments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Extension Chrome requise — ouvre WhatsApp Web et tente d&apos;ajouter
              les fichiers automatiquement.
            </p>
            <ul className="flex flex-wrap gap-2">
              {campaign.attachments.map((att) => (
                <li
                  key={att.id}
                  className="text-xs rounded-lg border border-white/10 bg-muted/40 px-3 py-1.5"
                >
                  {att.name} · {formatFileSize(att.size)} ·{" "}
                  {getAttachmentKind(att.mimeType)}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card className="card-elevated">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-[hsl(142,70%,38%)]" />
            Modèle de message
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground font-mono bg-muted/30 rounded-lg p-3 whitespace-pre-wrap border border-border/40">
            {campaign.template_message}
          </p>
          {logs[0] && (
            <WhatsAppMessagePreview
              text={compileMessage(
                campaign.template_message,
                getRowData(logs[0])
              )}
              label="Exemple rendu (1er contact)"
            />
          )}
        </CardContent>
      </Card>

      <Card className="card-elevated overflow-hidden">
        <CardHeader className="pb-2 border-b border-border/40">
          <CardTitle className="text-sm font-medium">
            Contacts à envoyer ({logs.length})
          </CardTitle>
        </CardHeader>
        <ScrollArea className="max-h-[min(70vh,720px)]">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="font-semibold">Contact</TableHead>
                <TableHead className="font-semibold">Téléphone</TableHead>
                <TableHead className="font-semibold">Aperçu</TableHead>
                <TableHead className="font-semibold">Statut</TableHead>
                <TableHead className="text-right font-semibold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    Aucun contact dans cette campagne. Recréez-la en important un
                    fichier Excel avec des numéros valides.
                  </TableCell>
                </TableRow>
              ) : (
              logs.map((log) => {
                const rowData = getRowData(log);
                const compiled = compileMessage(
                  campaign.template_message,
                  rowData
                );
                const isSent = log.status === "sent";
                const isSending = sendingId === log.contact_id;

                return (
                  <TableRow
                    key={log.id}
                    className={cn(
                      "transition-colors",
                      isSent && "bg-muted/20"
                    )}
                  >
                    <TableCell className="font-medium">
                      {log.contact.name ?? rowData["Nom"] ?? "—"}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {log.contact.phone}
                    </TableCell>
                    <TableCell className="min-w-[200px] max-w-sm align-top py-3">
                      <WhatsAppMessagePreview
                        text={compiled}
                        compact
                        label=""
                      />
                    </TableCell>
                    <TableCell>
                      {isSent ? (
                        <Badge className="bg-[hsl(142,70%,45%)]/10 text-[hsl(152,76%,32%)] border-[hsl(142,70%,45%)]/25 rounded-md">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Envoyé
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="rounded-md">
                          <Clock className="h-3 w-3 mr-1" />
                          En attente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        disabled={isSent || isSending}
                        onClick={() => handleSend(log)}
                        className={cn(
                          "rounded-lg min-w-[100px]",
                          !isSent && "btn-whatsapp"
                        )}
                      >
                        {isSending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-1" />
                            {isSent ? "Envoyé" : "Envoyer"}
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>
    </div>
  );
}
