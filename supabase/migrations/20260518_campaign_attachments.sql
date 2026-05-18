-- Pièces jointes par campagne (JPEG, PDF, PPT, audio…)
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS attachments JSONB NOT NULL DEFAULT '[]';
