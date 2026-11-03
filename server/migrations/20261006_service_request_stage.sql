ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS stage VARCHAR(50);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'service_requests'
      AND column_name = 'status'
  ) THEN
    EXECUTE $migration$
      UPDATE service_requests
      SET stage = status
      WHERE stage IS NULL
        AND status IN ('new', 'sourcing', 'supplier_ordered', 'delivered', 'installation', 'done', 'cancelled')
    $migration$;
  END IF;
END $$;

UPDATE service_requests SET stage = 'new' WHERE stage IS NULL;
ALTER TABLE service_requests ALTER COLUMN stage SET DEFAULT 'new';
ALTER TABLE service_requests ALTER COLUMN stage SET NOT NULL;