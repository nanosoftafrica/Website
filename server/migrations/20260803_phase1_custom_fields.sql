-- Phase 1: Custom Fields System Migration
-- Date: August 3, 2026
-- Purpose: Add metadata tables for custom objects, fields, and activity tracking

-- ============================================================================
-- TABLE: object_metadata
-- Defines entity types in the system (companies, contacts, opportunities, etc.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS object_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_singular VARCHAR(100) UNIQUE NOT NULL,
  name_plural VARCHAR(100) NOT NULL,
  label_singular VARCHAR(100) NOT NULL,
  label_plural VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  is_standard BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by_user_id INTEGER,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by_user_id INTEGER,
  CONSTRAINT check_names CHECK (
    name_singular ~ '^[a-z_]+$' AND
    name_plural ~ '^[a-z_]+$'
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_object_metadata_name_singular
  ON object_metadata(name_singular);
CREATE INDEX IF NOT EXISTS idx_object_metadata_is_standard
  ON object_metadata(is_standard);

-- ============================================================================
-- TABLE: field_metadata
-- Defines fields for each object type
-- ============================================================================

CREATE TABLE IF NOT EXISTS field_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  object_id UUID NOT NULL REFERENCES object_metadata(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  label VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  required BOOLEAN DEFAULT false,
  unique_constraint BOOLEAN DEFAULT false,
  default_value TEXT,
  placeholder VARCHAR(255),
  help_text TEXT,
  config JSONB DEFAULT '{}',
  display_order INTEGER DEFAULT 999,
  hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by_user_id INTEGER,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by_user_id INTEGER,
  CONSTRAINT check_field_name CHECK (name ~ '^[a-z_]+$'),
  UNIQUE (object_id, name)
);

CREATE INDEX IF NOT EXISTS idx_field_metadata_object_id ON field_metadata(object_id);
CREATE INDEX IF NOT EXISTS idx_field_metadata_type ON field_metadata(type);

-- ============================================================================
-- TABLE: records
-- Generic record storage for all objects (JSONB for flexible data)
-- ============================================================================

CREATE TABLE IF NOT EXISTS records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  object_id UUID NOT NULL REFERENCES object_metadata(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by_user_id INTEGER,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by_user_id INTEGER,
  assigned_to_user_id INTEGER,
  CONSTRAINT check_data CHECK (jsonb_typeof(data) = 'object')
);

CREATE INDEX IF NOT EXISTS idx_records_object_id ON records(object_id);
CREATE INDEX IF NOT EXISTS idx_records_created_at ON records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_records_assigned_to ON records(assigned_to_user_id);
CREATE INDEX IF NOT EXISTS idx_records_object_created ON records(object_id, created_at DESC);

-- ============================================================================
-- TABLE: tasks
-- Task/To-Do management linked to records (CRITICAL FEATURE)
-- ============================================================================

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'TODO',
  record_id UUID REFERENCES records(id) ON DELETE CASCADE,
  record_object_id UUID REFERENCES object_metadata(id),
  assigned_to_user_id INTEGER,
  created_by_user_id INTEGER NOT NULL,
  due_date DATE,
  due_time TIME,
  reminder_sent_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_status CHECK (status IN ('TODO', 'DONE'))
);

CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to
  ON tasks(assigned_to_user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_record_id ON tasks(record_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- ============================================================================
-- TABLE: notes
-- Simple notes attached to records
-- ============================================================================

CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  record_id UUID REFERENCES records(id) ON DELETE CASCADE,
  record_object_id UUID REFERENCES object_metadata(id),
  created_by_user_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notes_record_id ON notes(record_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);

-- ============================================================================
-- SEED DATA: Standard Objects
-- ============================================================================

INSERT INTO object_metadata (name_singular, name_plural, label_singular, label_plural, icon, is_standard, description)
VALUES
  ('company', 'companies', 'Company', 'Companies', '🏢', true, 'Customer organizations'),
  ('contact', 'contacts', 'Contact', 'Contacts', '👤', true, 'People at companies'),
  ('opportunity', 'opportunities', 'Opportunity', 'Opportunities', '🎯', true, 'Sales deals and opportunities'),
  ('project', 'projects', 'Project', 'Projects', '📋', true, 'Work orders and projects')
ON CONFLICT (name_singular) DO NOTHING;

-- ============================================================================
-- SEED DATA: Company Fields
-- ============================================================================

INSERT INTO field_metadata (object_id, name, label, type, required, display_order)
SELECT id, 'name', 'Name', 'text', true, 1 FROM object_metadata WHERE name_singular = 'company'
ON CONFLICT (object_id, name) DO NOTHING;

INSERT INTO field_metadata (object_id, name, label, type, display_order)
SELECT id, 'email', 'Email', 'email', 2 FROM object_metadata WHERE name_singular = 'company'
ON CONFLICT (object_id, name) DO NOTHING;

INSERT INTO field_metadata (object_id, name, label, type, display_order)
SELECT id, 'phone', 'Phone', 'phone', 3 FROM object_metadata WHERE name_singular = 'company'
ON CONFLICT (object_id, name) DO NOTHING;

INSERT INTO field_metadata (object_id, name, label, type, display_order, config)
SELECT id, 'annual_revenue', 'Annual Revenue (KES)', 'currency', 4, '{"currency": "KES"}'
FROM object_metadata WHERE name_singular = 'company'
ON CONFLICT (object_id, name) DO NOTHING;

INSERT INTO field_metadata (object_id, name, label, type, display_order, config)
SELECT id, 'status', 'Status', 'select', 5,
  '{"options": [
    {"value": "prospect", "label": "Prospect", "color": "#3b82f6"},
    {"value": "customer", "label": "Customer", "color": "#10b981"},
    {"value": "inactive", "label": "Inactive", "color": "#6b7280"}
  ]}'
FROM object_metadata WHERE name_singular = 'company'
ON CONFLICT (object_id, name) DO NOTHING;

-- ============================================================================
-- SEED DATA: Contact Fields
-- ============================================================================

INSERT INTO field_metadata (object_id, name, label, type, required, display_order)
SELECT id, 'name', 'Name', 'text', true, 1 FROM object_metadata WHERE name_singular = 'contact'
ON CONFLICT (object_id, name) DO NOTHING;

INSERT INTO field_metadata (object_id, name, label, type, display_order)
SELECT id, 'email', 'Email', 'email', 2 FROM object_metadata WHERE name_singular = 'contact'
ON CONFLICT (object_id, name) DO NOTHING;

INSERT INTO field_metadata (object_id, name, label, type, display_order)
SELECT id, 'phone', 'Phone', 'phone', 3 FROM object_metadata WHERE name_singular = 'contact'
ON CONFLICT (object_id, name) DO NOTHING;

INSERT INTO field_metadata (object_id, name, label, type, display_order)
SELECT id, 'job_title', 'Job Title', 'text', 4 FROM object_metadata WHERE name_singular = 'contact'
ON CONFLICT (object_id, name) DO NOTHING;

-- ============================================================================
-- SEED DATA: Opportunity Fields
-- ============================================================================

INSERT INTO field_metadata (object_id, name, label, type, required, display_order)
SELECT id, 'title', 'Opportunity Title', 'text', true, 1 FROM object_metadata WHERE name_singular = 'opportunity'
ON CONFLICT (object_id, name) DO NOTHING;

INSERT INTO field_metadata (object_id, name, label, type, display_order, config)
SELECT id, 'stage', 'Stage', 'select', 2,
  '{"options": [
    {"value": "new", "label": "New", "color": "#3b82f6"},
    {"value": "contacted", "label": "Contacted", "color": "#8b5cf6"},
    {"value": "qualified", "label": "Qualified", "color": "#ec4899"},
    {"value": "won", "label": "Won", "color": "#10b981"},
    {"value": "lost", "label": "Lost", "color": "#ef4444"}
  ]}'
FROM object_metadata WHERE name_singular = 'opportunity'
ON CONFLICT (object_id, name) DO NOTHING;

INSERT INTO field_metadata (object_id, name, label, type, display_order, config)
SELECT id, 'value', 'Value (KES)', 'currency', 3, '{"currency": "KES"}'
FROM object_metadata WHERE name_singular = 'opportunity'
ON CONFLICT (object_id, name) DO NOTHING;

INSERT INTO field_metadata (object_id, name, label, type, display_order)
SELECT id, 'expected_close_date', 'Expected Close Date', 'date', 4
FROM object_metadata WHERE name_singular = 'opportunity'
ON CONFLICT (object_id, name) DO NOTHING;

INSERT INTO field_metadata (object_id, name, label, type, display_order)
SELECT id, 'owner_username', 'Owner', 'text', 5
FROM object_metadata WHERE name_singular = 'opportunity'
ON CONFLICT (object_id, name) DO NOTHING;

-- ============================================================================
-- SEED DATA: Project Fields
-- ============================================================================

INSERT INTO field_metadata (object_id, name, label, type, required, display_order)
SELECT id, 'title', 'Project Title', 'text', true, 1 FROM object_metadata WHERE name_singular = 'project'
ON CONFLICT (object_id, name) DO NOTHING;

INSERT INTO field_metadata (object_id, name, label, type, display_order, config)
SELECT id, 'status', 'Status', 'select', 2,
  '{"options": [
    {"value": "new", "label": "New", "color": "#3b82f6"},
    {"value": "sourcing", "label": "Sourcing", "color": "#f59e0b"},
    {"value": "supplier_ordered", "label": "Supplier Ordered", "color": "#f59e0b"},
    {"value": "delivered", "label": "Delivered", "color": "#f59e0b"},
    {"value": "installation", "label": "Installation", "color": "#f59e0b"},
    {"value": "done", "label": "Done", "color": "#10b981"},
    {"value": "cancelled", "label": "Cancelled", "color": "#6b7280"}
  ]}'
FROM object_metadata WHERE name_singular = 'project'
ON CONFLICT (object_id, name) DO NOTHING;

INSERT INTO field_metadata (object_id, name, label, type, display_order, config)
SELECT id, 'value', 'Value (KES)', 'currency', 3, '{"currency": "KES"}'
FROM object_metadata WHERE name_singular = 'project'
ON CONFLICT (object_id, name) DO NOTHING;

INSERT INTO field_metadata (object_id, name, label, type, display_order)
SELECT id, 'expected_date', 'Expected Date', 'date', 4
FROM object_metadata WHERE name_singular = 'project'
ON CONFLICT (object_id, name) DO NOTHING;

INSERT INTO field_metadata (object_id, name, label, type, display_order)
SELECT id, 'description', 'Description', 'long_text', 5
FROM object_metadata WHERE name_singular = 'project'
ON CONFLICT (object_id, name) DO NOTHING;

-- ============================================================================
-- TABLE: task_reminders
-- Tracks which reminders have been sent for each task
-- ============================================================================

CREATE TABLE IF NOT EXISTS task_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  reminder_type VARCHAR(50) NOT NULL,
  scheduled_for DATE NOT NULL,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_reminder_type CHECK (reminder_type IN ('8am_daily', '1day_before'))
);

CREATE INDEX IF NOT EXISTS idx_task_reminders_task_id
  ON task_reminders(task_id);
CREATE INDEX IF NOT EXISTS idx_task_reminders_scheduled_for
  ON task_reminders(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_task_reminders_sent_at
  ON task_reminders(sent_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_task_reminders_unique
  ON task_reminders(task_id, reminder_type, scheduled_for);

-- ============================================================================
-- End of Migration
-- To run this migration:
-- psql -U postgres -d nanosoft_website -f server/migrations/20260803_phase1_custom_fields.sql
-- ============================================================================
