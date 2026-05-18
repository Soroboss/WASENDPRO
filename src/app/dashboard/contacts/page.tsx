"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  deleteContact,
  getCampaignContactGroups,
  getContactsSorted,
  runPhoneRepairOnce,
} from "@/lib/inforge";
import { downloadExcelTemplate } from "@/lib/excel";
import { getCustomFieldKeys } from "@/lib/contacts";
import type { CampaignContactGroup, Contact } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContactFormDialog } from "@/components/contacts/contact-form-dialog";
import { ContactsDirectoryTable } from "@/components/contacts/contacts-directory-table";
import { ContactsByCampaignView } from "@/components/contacts/contacts-by-campaign-view";
import {
  BookUser,
  Download,
  FolderKanban,
  Loader2,
  Users,
} from "lucide-react";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [campaignGroups, setCampaignGroups] = useState<CampaignContactGroup[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [tab, setTab] = useState("directory");

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

  const customKeys = useMemo(() => getCustomFieldKeys(contacts), [contacts]);

  const totalInCampaigns = useMemo(
    () =>
      campaignGroups.reduce((sum, g) => sum + g.entries.length, 0),
    [campaignGroups]
  );

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
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Suppression impossible.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Annuaire"
        description="Tous vos numéros classés, ou regroupés par campagne"
        icon={BookUser}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg btn-neon-outline"
              onClick={() => downloadExcelTemplate()}
            >
              <Download className="h-4 w-4 mr-2" />
              Modèle Excel
            </Button>
            <Badge
              variant="secondary"
              className="rounded-lg px-3 py-1.5 text-sm font-medium gap-1.5"
            >
              <Users className="h-3.5 w-3.5" />
              {contacts.length} numéro{contacts.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        }
      />

      <ContactFormDialog
        contact={editingContact}
        fieldKeys={customKeys}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={load}
      />

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="rounded-xl h-10 p-1 bg-muted/50 border border-border/50">
          <TabsTrigger value="directory" className="rounded-lg gap-2 px-4">
            <BookUser className="h-4 w-4" />
            Annuaire global
            <Badge variant="outline" className="ml-1 h-5 px-1.5 text-[10px]">
              {contacts.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="rounded-lg gap-2 px-4">
            <FolderKanban className="h-4 w-4" />
            Par campagne
            <Badge variant="outline" className="ml-1 h-5 px-1.5 text-[10px]">
              {campaignGroups.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-9 w-9 animate-spin text-neon/60" />
          </div>
        ) : (
          <>
            <TabsContent value="directory" className="mt-6">
              {contacts.length === 0 ? (
                <Card className="card-futurist border-dashed border-neon/20">
                  <CardContent className="py-20 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-neon/25 bg-neon/10 mx-auto mb-5 shadow-glow">
                      <BookUser className="h-8 w-8 text-neon" />
                    </div>
                    <p className="font-semibold">Aucun contact</p>
                    <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                      Importez un fichier Excel lors d&apos;une campagne. Les
                      numéros seront triés ici automatiquement.
                    </p>
                    <Button
                      className="mt-6 btn-whatsapp rounded-lg"
                      onClick={() => downloadExcelTemplate()}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger le modèle
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <ContactsDirectoryTable
                  contacts={contacts}
                  customKeys={customKeys}
                  deletingId={deletingId}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </TabsContent>

            <TabsContent value="campaigns" className="mt-6">
              {campaignGroups.length === 0 ? (
                <Card className="card-futurist border-dashed border-neon/20">
                  <CardContent className="py-20 text-center">
                    <FolderKanban className="h-10 w-10 text-neon mx-auto mb-4" />
                    <p className="font-semibold">Aucune campagne avec contacts</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Créez une campagne et importez un fichier Excel.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    {totalInCampaigns} entrée
                    {totalInCampaigns > 1 ? "s" : ""} répartie
                    {totalInCampaigns > 1 ? "s" : ""} dans{" "}
                    {campaignGroups.length} campagne
                    {campaignGroups.length > 1 ? "s" : ""} — numéros triés dans
                    chaque liste.
                  </p>
                  <ContactsByCampaignView
                    groups={campaignGroups}
                    deletingId={deletingId}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
