-- Snapshot des données Excel par contact dans une campagne
ALTER TABLE campaign_logs
  ADD COLUMN IF NOT EXISTS row_data JSONB NOT NULL DEFAULT '{}';
