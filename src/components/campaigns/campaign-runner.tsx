"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CampaignFormDialog } from "@/components/campaigns/campaign-form-dialog";
import { compileMessage } from "@/lib/message";
import {
  CampaignContactsPagination,
  paginateItems,
} from "@/components/campaigns/campaign-contacts-pagination";
import { formatDialDisplay, getCountryByDial } from "@/lib/countries";
import { getWhatsAppPhoneError, openWhatsApp } from "@/lib/whatsapp";
import { queueWhatsAppAttachments } from "@/lib/whatsapp-bridge";
import { formatFileSize } from "@/lib/attachments";
import { exportCampaignReport } from "@/lib/excel";
import { logsToImportedRows } from "@/lib/campaign-sources";
import {
  getCampaign,
  getCampaignLogs,
  markContactAsSent,
} from "@/lib/inforge";
import type { Campaign, CampaignFormPrefill, CampaignLog, Contact } from "@/types";
import {
  Send,
  FileDown,
  CheckCircle2,
  Clock,
  Loader2,
  ArrowLeft,
  Megaphone,
  Paperclip,
  Archive,
  Zap,
  Copy,
} from "lucide-react";
interface LogWithContact extends CampaignLog {
  contact: Contact;
}

interface CampaignRunnerProps {
  campaignId: string;
}

function ContactRow({
  log,
  compiled,
  isSending,
  onSend,
}: {
  log: LogWithContact;
  compiled: string;
  isSending: boolean;
  onSend: (log: LogWithContact) => void;
}) {
  const rowData =
    log.row_data && Object.keys(log.row_data).length > 0
      ? log.row_data
      : log.contact.custom_data ?? {};
  const displayName =
    log.contact.name?.trim() || rowData["Nom"]?.trim() || "Sans nom";

  return (
    <TableRow className="border-border/30 hover:bg-muted/15">
      <TableCell className="font-medium align-middle max-w-[160px]">
        <span className="block truncate" title={displayName}>
          {displayName}
        </span>
      </TableCell>
      <TableCell className="align-middle">
        <code className="font-mono text-sm bg-muted/40 px-2 py-0.5 rounded-md whitespace-nowrap">
          {log.contact.phone}
        </code>
      </TableCell>
      <TableCell className="align-middle max-w-[280px]">
        <p
          className="text-xs text-muted-foreground line-clamp-2 leading-relaxed"
          title={compiled}
        >
          {compiled}
        </p>
      </TableCell>
      <TableCell className="text-right align-middle">
        <Button
          size="sm"
          disabled={isSending}
          onClick={() => onSend(log)}
          className="rounded-lg min-w-[100px] btn-whatsapp"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Send className="h-4 w-4 mr-1" />
              Envoyer
            </>
          )}
        </Button>
      </TableCell>
    </TableRow>
  );
}

export function CampaignRunner({ campaignId }: CampaignRunnerProps) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [logs, setLogs] = useState<LogWithContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [listTab, setListTab] = useState<"pending" | "sent">("pending");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [relanceOpen, setRelanceOpen] = useState(false);
  const [relancePrefill, setRelancePrefill] = useState<CampaignFormPrefill | null>(
    null
  );

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

  const { pendingLogs, sentLogs } = useMemo(() => {
    const pending: LogWithContact[] = [];
    const sent: LogWithContact[] = [];
    for (const log of logs) {
      if (log.status === "sent") sent.push(log);
      else pending.push(log);
    }
    return { pendingLogs: pending, sentLogs: sent };
  }, [logs]);

  const activeLogs = listTab === "pending" ? pendingLogs : sentLogs;

  useEffect(() => {
    setPage(1);
  }, [listTab, activeLogs.length, pageSize]);

  const paginatedLogs = useMemo(
    () => paginateItems(activeLogs, page, pageSize),
    [activeLogs, page, pageSize]
  );

  const countryDial = campaign?.country_dial ?? "33";
  const countryLabel = getCountryByDial(countryDial);

  const getRowData = (log: LogWithContact): Record<string, string> => {
    if (log.row_data && Object.keys(log.row_data).length > 0) {
      return log.row_data;
    }
    return log.contact.custom_data ?? {};
  };

  const handleSend = useCallback(
    (log: LogWithContact) => {
      if (!campaign || log.status === "sent") return;
      const rowData = getRowData(log);
      const compiled = compileMessage(campaign.template_message, rowData);
      const phone = log.contact.phone;
      const attachments = campaign.attachments ?? [];
      const hasAttachments = attachments.length > 0;

      const phoneError = getWhatsAppPhoneError(phone, countryDial);
      if (phoneError) {
        alert(phoneError);
        return;
      }

      const opened = openWhatsApp(phone, compiled, { useWeb: hasAttachments });
      if (!opened) {
        alert("Impossible d'ouvrir WhatsApp pour ce contact.");
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
    },
    [campaign, countryDial]
  );

  const nextPending = pendingLogs[0] ?? null;

  const handleSendNext = useCallback(() => {
    if (nextPending) handleSend(nextPending);
  }, [nextPending, handleSend]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.key === "n" && !e.metaKey && !e.ctrlKey && listTab === "pending") {
        e.preventDefault();
        handleSendNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleSendNext, listTab]);

  const openRelance = (filter: "pending" | "sent" | "all") => {
    if (!campaign) return;
    const { headers, rows } = logsToImportedRows(
      logs.map((l) => ({
        contact: l.contact,
        status: l.status,
        row_data: l.row_data,
      })),
      filter
    );
    setRelancePrefill({
      name: `Relance — ${campaign.name}`,
      template_message: campaign.template_message,
      countryDialCode: campaign.country_dial,
      sourceCampaignId: campaign.id,
      relanceFilter: filter,
      columnHeaders: headers,
      importedRows: rows,
    });
    setRelanceOpen(true);
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
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="h-9 w-9 animate-spin text-neon/60" />
        <p className="text-sm text-muted-foreground">Chargement de la campagne…</p>
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

  const sentCount = sentLogs.length;
  const progress =
    logs.length > 0 ? Math.round((sentCount / logs.length) * 100) : 0;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-28">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux campagnes
      </Link>

      <PageHeader
        title={campaign.name}
        icon={Megaphone}
        description={
          <>
            {sentCount}/{logs.length} envoyés · {pendingLogs.length} restant
            {pendingLogs.length !== 1 ? "s" : ""}
            {countryLabel && (
              <>
                {" "}
                · {countryLabel.flag} {formatDialDisplay(countryDial)}
              </>
            )}
          </>
        }
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              onClick={() => openRelance("pending")}
            >
              <Copy className="h-4 w-4 mr-2" />
              Relance (non envoyés)
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              onClick={handleExport}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Rapport Excel
            </Button>
          </div>
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
            <ul className="flex flex-wrap gap-2">
              {campaign.attachments.map((att) => (
                <li
                  key={att.id}
                  className="text-xs rounded-lg border border-white/10 bg-muted/40 px-3 py-1.5"
                >
                  {att.name} · {formatFileSize(att.size)}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card className="card-elevated overflow-hidden">
        <Tabs
          value={listTab}
          onValueChange={(v) => setListTab(v as "pending" | "sent")}
          className="w-full"
        >
          <CardHeader className="pb-2 border-b border-border/40">
            <TabsList className="grid w-full max-w-md grid-cols-2 h-10">
              <TabsTrigger value="pending" className="gap-2 rounded-lg">
                <Clock className="h-4 w-4" />
                À envoyer
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                  {pendingLogs.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="sent" className="gap-2 rounded-lg">
                <Archive className="h-4 w-4" />
                Archives
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                  {sentCount}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          <TabsContent value="pending" className="mt-0">
            {pendingLogs.length === 0 ? (
              <CardContent className="py-16 text-center text-muted-foreground">
                <CheckCircle2 className="h-10 w-10 text-[hsl(152,76%,45%)] mx-auto mb-3" />
                <p className="font-medium text-foreground">
                  Tous les contacts ont été envoyés
                </p>
                <p className="text-sm mt-2">
                  Consultez l&apos;onglet Archives ou lancez une relance.
                </p>
                <Button
                  variant="outline"
                  className="mt-4 rounded-lg"
                  onClick={() => setListTab("sent")}
                >
                  Voir les archives
                </Button>
              </CardContent>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead>Contact</TableHead>
                        <TableHead>Téléphone</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedLogs.map((log) => (
                        <ContactRow
                          key={log.id}
                          log={log}
                          compiled={compileMessage(
                            campaign.template_message,
                            getRowData(log)
                          )}
                          isSending={sendingId === log.contact_id}
                          onSend={handleSend}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <CampaignContactsPagination
                  total={pendingLogs.length}
                  page={page}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                />
              </>
            )}
          </TabsContent>

          <TabsContent value="sent" className="mt-0">
            {sentLogs.length === 0 ? (
              <CardContent className="py-12 text-center text-muted-foreground text-sm">
                Aucun envoi pour le moment.
              </CardContent>
            ) : (
              <>
                <div className="overflow-x-auto max-h-[50vh]">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead>Contact</TableHead>
                        <TableHead>Téléphone</TableHead>
                        <TableHead>Envoyé le</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedLogs.map((log) => (
                        <TableRow key={log.id} className="bg-muted/10">
                          <TableCell className="font-medium">
                            {log.contact.name ?? "—"}
                          </TableCell>
                          <TableCell className="font-mono text-sm text-muted-foreground">
                            {log.contact.phone}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {log.sent_at
                              ? format(
                                  new Date(log.sent_at),
                                  "dd MMM yyyy HH:mm",
                                  { locale: fr }
                                )
                              : "—"}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-[hsl(142,70%,45%)]/10 text-[hsl(152,76%,32%)] border-[hsl(142,70%,45%)]/25 rounded-md">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Envoyé
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <CampaignContactsPagination
                  total={sentLogs.length}
                  page={page}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                />
              </>
            )}
          </TabsContent>
        </Tabs>
      </Card>

      {listTab === "pending" && pendingLogs.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur-md px-4 py-3">
          <div className="mx-auto max-w-6xl flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              <kbd className="rounded border px-1.5 py-0.5 text-[10px] font-mono bg-muted">
                N
              </kbd>{" "}
              — envoyer le suivant · {pendingLogs.length} restant
              {pendingLogs.length > 1 ? "s" : ""}
            </p>
            <Button
              className="btn-whatsapp rounded-xl min-w-[200px]"
              disabled={!nextPending || sendingId !== null}
              onClick={handleSendNext}
            >
              <Zap className="h-4 w-4 mr-2" />
              Envoyer le suivant
              {nextPending && (
                <span className="ml-2 opacity-80 font-mono text-xs truncate max-w-[120px]">
                  {nextPending.contact.phone}
                </span>
              )}
            </Button>
          </div>
        </div>
      )}

      <CampaignFormDialog
        open={relanceOpen}
        onOpenChange={setRelanceOpen}
        onCreated={() => {
          setRelanceOpen(false);
          setRelancePrefill(null);
        }}
        prefill={relancePrefill}
      />
    </div>
  );
}
