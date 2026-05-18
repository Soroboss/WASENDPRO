"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { CampaignFormDialog } from "@/components/campaigns/campaign-form-dialog";
import { ConnectionStatus } from "@/components/dashboard/connection-status";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { getCampaigns, deleteCampaign, getContacts } from "@/lib/inforge";
import type { Campaign } from "@/types";
import {
  Plus,
  Megaphone,
  Trash2,
  ChevronRight,
  Loader2,
  Calendar,
} from "lucide-react";

export default function DashboardPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [contactCount, setContactCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [data, contacts] = await Promise.all([
        getCampaigns(),
        getContacts(),
      ]);
      setCampaigns(data);
      setContactCount(contacts.length);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Supprimer cette campagne ?")) return;
    await deleteCampaign(id);
    load();
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Campagnes"
        description="Créez et gérez vos envois WhatsApp personnalisés"
        icon={Megaphone}
        action={
          <Button
            onClick={() => setDialogOpen(true)}
            className="btn-whatsapp rounded-xl h-10 px-5"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle campagne
          </Button>
        }
      />

      <ConnectionStatus />

      {!loading && (
        <DashboardStats
          campaignCount={campaigns.length}
          contactCount={contactCount}
        />
      )}

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-9 w-9 animate-spin text-neon/60" />
        </div>
      ) : campaigns.length === 0 ? (
        <Card className="card-futurist border-dashed border-neon/20">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-neon/25 bg-neon/10 mb-5 shadow-glow">
              <Megaphone className="h-8 w-8 text-neon" />
            </div>
            <p className="font-semibold text-lg">Aucune campagne</p>
            <p className="text-sm text-muted-foreground mt-2 mb-8 max-w-sm">
              Lancez votre première campagne en important vos contacts Excel.
            </p>
            <Button
              onClick={() => setDialogOpen(true)}
              className="btn-whatsapp rounded-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer une campagne
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {campaigns.map((campaign) => (
            <Link
              key={campaign.id}
              href={`/dashboard/campaigns/${campaign.id}`}
              className="block group"
            >
              <Card className="card-futurist h-full cursor-pointer group-hover:border-neon/40 group-hover:shadow-glow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-semibold font-display group-hover:text-neon transition-colors line-clamp-1">
                      {campaign.name}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                      onClick={(e) => handleDelete(campaign.id, e)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed bg-black/30 border border-white/5 rounded-lg p-3 font-mono">
                    {campaign.template_message}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(campaign.created_at), "dd MMM yyyy", {
                        locale: fr,
                      })}
                    </span>
                    <div className="flex items-center gap-2">
                      {campaign.scheduled_date && (
                        <Badge
                          variant="outline"
                          className="text-[10px] rounded-md border-neon/30 text-neon bg-neon/5"
                        >
                          Programmée
                        </Badge>
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-neon group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <CampaignFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={load}
      />
    </div>
  );
}
