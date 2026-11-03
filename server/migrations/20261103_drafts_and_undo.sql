-- Drafts kept beside a published page or post, and the undo history.
-- Idempotent: safe on databases that sync() already created.
ALTER TABLE IF EXISTS pages ADD COLUMN IF NOT EXISTS draft_data JSON DEFAULT NULL;
ALTER TABLE IF EXISTS posts ADD COLUMN IF NOT EXISTS draft_data JSON DEFAULT NULL;

CREATE TABLE IF NOT EXISTS content_revisions (
  id SERIAL PRIMARY KEY,
  entity VARCHAR(40) NOT NULL,
  entity_id INTEGER NOT NULL,
  snapshot JSONB NOT NULL,
  admin_username VARCHAR(255) DEFAULT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS content_revisions_entity_entity_id_created_at ON content_revisions (entity, entity_id, "createdAt");
