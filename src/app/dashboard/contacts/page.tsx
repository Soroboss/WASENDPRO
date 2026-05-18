"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  deleteContact,
  getCampaignContactGroups,
  getContactsSorted,
  runPhoneRepairOnce,
} from "@/lib/inforge";
import { downloadExcelTemplate, exportContactsToExcel } from "@/lib/excel";
import { getCustomFieldKeys } from "@/lib/contacts";
import {
  filterAndSortContacts,
  filterCampaignGroups,
  getDialCounts,
  type CampaignStatusFilter,
  type ContactFilterState,
  type ContactSort,
  type HasNameFilter,
} from "@/lib/contact-filters";
import type { CampaignContactGroup, Contact } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContactFormDialog } from "@/components/contacts/contact-form-dialog";
import { ContactsDirectoryTable } from "@/components/contacts/contacts-directory-table";
import { ContactsByCampaignView } from "@/components/contacts/contacts-by-campaign-view";
import { ContactsStats } from "@/components/contacts/contacts-stats";
import { ContactsToolbar } from "@/components/contacts/contacts-toolbar";
import { ContactsCampaignToolbar } from "@/components/contacts/contacts-campaign-toolbar";
import {
  BookUser,
  Download,
  FolderKanban,
  Loader2,
  Plus,
  Users,
} from "lucide-react";
import Link from "next/link";

const defaultFilters: ContactFilterState = {
  search: "",
  dialCode: "",
  sort: "phone",
  hasName: "all",
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [campaignGroups, setCampaignGroups] = useState<CampaignContactGroup[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [tab, setTab] = useState("directory");

  const [filters, setFilters] = useState<ContactFilterState>(defaultFilters);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [campaignSearch, setCampaignSearch] = useState("");
  const [campaignIdFilter, setCampaignIdFilter] = useState("");
  const [campaignStatus, setCampaignStatus] =
    useState<CampaignStatusFilter>("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const repaired = await runPhoneRepairOnce();
      const [sorted, groups] = await Promise.all([
        getContactsSorted(),
        getCampaignContactGroups(),
      ]);
      setContacts(sorted);
      setCampaignGroups(groups);
      if (repaired > 0) {
        console.info(
          `[BISWasend] ${repaired} numéro(s) corrigé(s) (zéro après indicatif restauré).`
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [filters, tab]);

  const customKeys = useMemo(() => getCustomFieldKeys(contacts), [contacts]);
  const dialCounts = useMemo(() => getDialCounts(contacts), [contacts]);

  const filteredContacts = useMemo(
    () => filterAndSortContacts(contacts, filters),
    [contacts, filters]
  );

  const filteredCampaignGroups = useMemo(
    () =>
      filterCampaignGroups(campaignGroups, {
        search: campaignSearch,
        campaignId: campaignIdFilter,
        status: campaignStatus,
      }),
    [campaignGroups, campaignSearch, campaignIdFilter, campaignStatus]
  );

  const visibleCampaignCount = useMemo(
    () =>
      filteredCampaignGroups.reduce((s, g) => s + g.entries.length, 0),
    [filteredCampaignGroups]
  );

  const withName = useMemo(
    () => contacts.filter((c) => c.name?.trim()).length,
    [contacts]
  );

  const selectedContacts = useMemo(
    () => contacts.filter((c) => selectedIds.has(c.id)),
    [contacts, selectedIds]
  );

  const allVisibleSelected =
    filteredContacts.length > 0 &&
    filteredContacts.every((c) => selectedIds.has(c.id));

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredContacts.forEach((c) => next.delete(c.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredContacts.forEach((c) => next.add(c.id));
        return next;
      });
    }
  };

  const handleBulkCopy = async () => {
    const phones = selectedContacts.map((c) => c.phone).join("\n");
    try {
      await navigator.clipboard.writeText(phones);
    } catch {
      alert("Impossible de copier dans le presse-papiers.");
    }
  };

  const handleBulkExport = () => {
    const list =
      selectedContacts.length > 0 ? selectedContacts : filteredContacts;
    exportContactsToExcel(
      list,
      `annuaire_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  const handleBulkDelete = async () => {
    if (selectedContacts.length === 0) return;
    if (
      !confirm(
        `Supprimer ${selectedContacts.length} contact(s) ?\nLes entrées de campagne liées seront aussi retirées.`
      )
    ) {
      return;
    }
    setBulkBusy(true);
    try {
      for (const c of selectedContacts) {
        await deleteContact(c.id);
      }
      setSelectedIds(new Set());
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Suppression impossible.");
    } finally {
      setBulkBusy(false);
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setEditOpen(true);
  };

  const handleDelete = async (contact: Contact) => {
    const label = contact.name || contact.phone;
    if (
      !confirm(
        `Supprimer ${label} ?\nLes entrées de campagne liées seront aussi retirées.`
      )
    ) {
      return;
    }
    setDeletingId(contact.id);
    try {
      await deleteContact(contact.id);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(contact.id);
        return next;
      });
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Suppression impossible.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Annuaire"
        description="Gérez vos contacts, filtrez et lancez des actions groupées"
        icon={BookUser}
        action={
          <motion.div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg btn-neon-outline"
              onClick={() => downloadExcelTemplate()}
            >
              <Download className="h-4 w-4 mr-2" />
              Modèle Excel
            </Button>
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ size: "sm" }),
                "rounded-lg btn-whatsapp"
              )}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle campagne
            </Link>
          </motion.div>
        }
      />

      {!loading && (
        <ContactsStats
          totalContacts={contacts.length}
          campaignCount={campaignGroups.length}
          withName={withName}
          withoutName={contacts.length - withName}
        />
      )}

      <ContactFormDialog
        contact={editingContact}
        fieldKeys={customKeys}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={load}
      />

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="rounded-xl h-11 p-1 bg-muted/40 border border-border/50 w-full sm:w-auto">
          <TabsTrigger
            value="directory"
            className="rounded-lg gap-2 px-5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <BookUser className="h-4 w-4" />
            Annuaire global
            <Badge
              variant="secondary"
              className="ml-1 h-5 px-1.5 text-[10px] font-mono"
            >
              {contacts.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="campaigns"
            className="rounded-lg gap-2 px-5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <FolderKanban className="h-4 w-4" />
            Par campagne
            <Badge
              variant="secondary"
              className="ml-1 h-5 px-1.5 text-[10px] font-mono"
            >
              {campaignGroups.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-28 gap-3"
          >
            <Loader2 className="h-10 w-10 animate-spin text-neon/60" />
            <p className="text-sm text-muted-foreground">
              Chargement de l&apos;annuaire…
            </p>
          </motion.div>
        ) : (
          <>
            <TabsContent value="directory" className="mt-5 space-y-4">
              {contacts.length > 0 && (
                <ContactsToolbar
                  search={filters.search}
                  onSearchChange={(search) =>
                    setFilters((f) => ({ ...f, search }))
                  }
                  dialCode={filters.dialCode}
                  onDialCodeChange={(dialCode) =>
                    setFilters((f) => ({ ...f, dialCode }))
                  }
                  sort={filters.sort}
                  onSortChange={(sort) =>
                    setFilters((f) => ({ ...f, sort: sort as ContactSort }))
                  }
                  hasName={filters.hasName}
                  onHasNameChange={(hasName) =>
                    setFilters((f) => ({
                      ...f,
                      hasName: hasName as HasNameFilter,
                    }))
                  }
                  dialCounts={dialCounts}
                  filteredCount={filteredContacts.length}
                  totalCount={contacts.length}
                  selectedCount={selectedContacts.length}
                  onSelectAll={handleSelectAllVisible}
                  onClearSelection={() => setSelectedIds(new Set())}
                  allVisibleSelected={allVisibleSelected}
                  onBulkDelete={handleBulkDelete}
                  onBulkCopy={handleBulkCopy}
                  onBulkExport={handleBulkExport}
                  bulkBusy={bulkBusy}
                />
              )}

              {contacts.length === 0 ? (
                <Card className="card-futurist border-dashed border-neon/25">
                  <CardContent className="py-24 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-neon/30 bg-gradient-to-br from-neon/15 to-cyan-neon/5 mx-auto mb-6 shadow-glow">
                      <Users className="h-10 w-10 text-neon" />
                    </div>
                    <h2 className="text-xl font-semibold">Votre annuaire est vide</h2>
                    <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
                      Importez un fichier Excel lors d&apos;une campagne. Tous
                      vos numéros seront classés et filtrables ici.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 mt-8">
                      <Button
                        className="btn-whatsapp rounded-xl"
                        onClick={() => downloadExcelTemplate()}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Modèle Excel
                      </Button>
                      <Link
                        href="/dashboard"
                        className={cn(
                          buttonVariants({ variant: "outline" }),
                          "rounded-xl btn-neon-outline inline-flex items-center"
                        )}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Créer une campagne
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ) : filteredContacts.length === 0 ? (
                <Card className="card-futurist border-dashed">
                  <CardContent className="py-16 text-center">
                    <p className="font-medium">Aucun résultat</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Modifiez ou réinitialisez les filtres ci-dessus.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <ContactsDirectoryTable
                  contacts={filteredContacts}
                  customKeys={customKeys}
                  deletingId={deletingId}
                  selectedIds={selectedIds}
                  onToggleSelect={handleToggleSelect}
                  onToggleSelectAll={handleSelectAllVisible}
                  allSelected={allVisibleSelected}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </TabsContent>

            <TabsContent value="campaigns" className="mt-5 space-y-4">
              {campaignGroups.length > 0 && (
                <ContactsCampaignToolbar
                  groups={campaignGroups}
                  search={campaignSearch}
                  onSearchChange={setCampaignSearch}
                  campaignId={campaignIdFilter}
                  onCampaignIdChange={setCampaignIdFilter}
                  status={campaignStatus}
                  onStatusChange={setCampaignStatus}
                  visibleCount={visibleCampaignCount}
                />
              )}

              {campaignGroups.length === 0 ? (
                <Card className="card-futurist border-dashed border-neon/25">
                  <CardContent className="py-24 text-center">
                    <FolderKanban className="h-12 w-12 text-neon mx-auto mb-4 opacity-80" />
                    <h2 className="text-lg font-semibold">
                      Aucune campagne avec contacts
                    </h2>
                    <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                      Créez une campagne et importez un fichier Excel pour voir
                      vos contacts regroupés ici.
                    </p>
                    <Link
                      href="/dashboard"
                      className={cn(
                        buttonVariants(),
                        "mt-6 btn-whatsapp rounded-xl inline-flex items-center"
                      )}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nouvelle campagne
                    </Link>
                  </CardContent>
                </Card>
              ) : filteredCampaignGroups.length === 0 ? (
                <Card className="card-futurist border-dashed">
                  <CardContent className="py-16 text-center text-muted-foreground">
                    Aucune entrée ne correspond aux filtres.
                  </CardContent>
                </Card>
              ) : (
                <ContactsByCampaignView
                  groups={filteredCampaignGroups}
                  deletingId={deletingId}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
