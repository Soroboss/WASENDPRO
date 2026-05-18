import { CampaignRunner } from "@/components/campaigns/campaign-runner";

interface CampaignPageProps {
  params: { id: string };
}

export default function CampaignPage({ params }: CampaignPageProps) {
  return <CampaignRunner campaignId={params.id} />;
}
