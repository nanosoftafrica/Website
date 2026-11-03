-- ITIL V5 Phase 1: Incident Management + Service Request Management
-- Date: August 10, 2026
-- Purpose: rename work_orders -> service_requests (its stage lifecycle is a
-- procurement/fulfillment flow, i.e. ITIL Service Request Management, not
-- Incident Management); add a greenfield incidents table; generalize
-- assignments to be polymorphic across both ticket types.

-- ============================================================================
-- 1. work_orders -> service_requests
-- ============================================================================

ALTER TABLE IF EXISTS work_orders RENAME TO service_requests;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_work_orders_stage') THEN
    ALTER TYPE enum_work_orders_stage RENAME TO enum_service_requests_stage;
  END IF;
END $$;

-- ============================================================================
-- 2. TABLE: incidents
-- Greenfield ITIL Incident Management entity: severity/impact/urgency feed a
-- server-derived priority (see lib/ticketStages.ts); status lifecycle tracks
-- resolution/closure timestamps.
-- ============================================================================

CREATE TABLE IF NOT EXISTS incidents (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  contact_id INTEGER NOT NULL,
  company_id INTEGER,
  severity VARCHAR(20) NOT NULL DEFAULT 'medium',
  impact VARCHAR(20) NOT NULL DEFAULT 'medium',
  urgency VARCHAR(20) NOT NULL DEFAULT 'medium',
  priority VARCHAR(20) NOT NULL DEFAULT 'p3',
  status VARCHAR(20) NOT NULL DEFAULT 'new',
  owner_username VARCHAR(255) DEFAULT '',
  sla_target_at TIMESTAMP,
  resolved_at TIMESTAMP,
  closed_at TIMESTAMP,
  "order" INTEGER DEFAULT 0,
  notes TEXT DEFAULT '',
  -- Sequelize's default (unoverridden) timestamp field mapping expects
  -- literal camelCase columns — matches how service_requests/assignments
  -- already exist (created via the old sequelize.sync() flow), not the
  -- snake_case convention used elsewhere in this file's other tables.
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CHECK constraints aren't IF NOT EXISTS-able in Postgres; guard each with a
-- duplicate_object-swallowing DO block so this file stays idempotent.
DO $$ BEGIN
  ALTER TABLE incidents ADD CONSTRAINT check_incident_severity CHECK (severity IN ('critical','high','medium','low'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE incidents ADD CONSTRAINT check_incident_impact CHECK (impact IN ('high','medium','low'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE incidents ADD CONSTRAINT check_incident_urgency CHECK (urgency IN ('high','medium','low'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE incidents ADD CONSTRAINT check_incident_priority CHECK (priority IN ('p1','p2','p3','p4'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE incidents ADD CONSTRAINT check_incident_status CHECK (status IN ('new','in_progress','on_hold','resolved','closed'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_contact_id ON incidents(contact_id);
CREATE INDEX IF NOT EXISTS idx_incidents_company_id ON incidents(company_id);
CREATE INDEX IF NOT EXISTS idx_incidents_priority ON incidents(priority);

-- ============================================================================
-- 3. Generalize assignments: work_order_id -> polymorphic ticket_type/ticket_id
-- so the same table can serve both Incidents and Service Requests.
-- ============================================================================

CREATE TABLE IF NOT EXISTS assignments (
  id SERIAL PRIMARY KEY,
  work_order_id INTEGER,
  assignee_type VARCHAR(20) NOT NULL,
  assignee_id INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'assigned',
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  acknowledged_at TIMESTAMP,
  completed_at TIMESTAMP,
  notes TEXT DEFAULT '',
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE assignments ADD COLUMN IF NOT EXISTS ticket_type VARCHAR(20);
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS ticket_id INTEGER;

UPDATE assignments
   SET ticket_type = 'service_request', ticket_id = work_order_id
 WHERE ticket_type IS NULL AND work_order_id IS NOT NULL;

ALTER TABLE assignments ALTER COLUMN ticket_type SET NOT NULL;
ALTER TABLE assignments ALTER COLUMN ticket_id SET NOT NULL;
ALTER TABLE assignments DROP COLUMN IF EXISTS work_order_id;

DO $$ BEGIN
  ALTER TABLE assignments ADD CONSTRAINT check_assignment_ticket_type CHECK (ticket_type IN ('service_request','incident'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_assignments_ticket ON assignments(ticket_type, ticket_id);
