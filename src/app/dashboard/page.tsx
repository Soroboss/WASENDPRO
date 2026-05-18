"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CampaignFormDialog } from "@/components/campaigns/campaign-form-dialog";
import { getCampaigns, deleteCampaign, isUsingLocalStorage } from "@/lib/inforge";
import type { Campaign } from "@/types";
import {
  Plus,
  Megaphone,
  Trash2,
  ChevronRight,
  Loader2,
  Database,
} from "lucide-react";

export default function DashboardPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCampaigns();
      setCampaigns(data);
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campagnes</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Créez et gérez vos campagnes WhatsApp
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-whatsapp hover:bg-whatsapp-dark text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle campagne
        </Button>
      </div>

      {isUsingLocalStorage() && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
          <Database className="h-4 w-4 shrink-0" />
          Mode démo : données stockées en local. Configurez{" "}
          <code className="text-xs bg-amber-100 dark:bg-amber-900/50 px-1 rounded">
            NEXT_PUBLIC_INSFORGE_URL
          </code>{" "}
          pour connecter InsForge.
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : campaigns.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Megaphone className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="font-medium">Aucune campagne</p>
            <p className="text-sm text-muted-foreground mt-1 mb-6">
              Créez votre première campagne pour commencer.
            </p>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-whatsapp hover:bg-whatsapp-dark text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle campagne
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {campaigns.map((campaign) => (
            <Link
              key={campaign.id}
              href={`/dashboard/campaigns/${campaign.id}`}
            >
              <Card className="group hover:shadow-md transition-all cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base group-hover:text-whatsapp transition-colors">
                      {campaign.name}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleDelete(campaign.id, e)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground line-clamp-2 font-mono mb-3">
                    {campaign.template_message}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(campaign.created_at), "dd MMM yyyy", {
                        locale: fr,
                      })}
                    </span>
                    {campaign.scheduled_date && (
                      <Badge variant="outline" className="text-xs">
                        Programmée
                      </Badge>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-whatsapp transition-colors" />
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
