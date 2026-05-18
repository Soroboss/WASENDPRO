-- Exécuter une fois sur InsForge si les colonnes manquent (erreur schema cache)

ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS attachments JSONB NOT NULL DEFAULT '[]';

ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS country_dial TEXT NOT NULL DEFAULT '33';

ALTER TABLE campaign_logs
  ADD COLUMN IF NOT EXISTS row_data JSONB NOT NULL DEFAULT '{}';
