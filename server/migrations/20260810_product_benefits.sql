-- Add a `benefits` JSONB column to products: array of { icon, title, description }
-- shown as an icon-strip below the CTA on the product detail page.
ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS benefits JSONB DEFAULT '[]';
