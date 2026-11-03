-- Client Devices & Preventative Maintenance Tracking Migration
-- Date: September 16, 2026
-- Purpose: Track installed hardware on client premises, maintenance schedules, and service activity logs.

CREATE TABLE IF NOT EXISTS client_devices (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
  device_name VARCHAR(255) NOT NULL,
  device_type VARCHAR(100) NOT NULL DEFAULT 'other',
  brand VARCHAR(100) DEFAULT '',
  model_number VARCHAR(100) DEFAULT '',
  serial_number VARCHAR(100) DEFAULT '',
  asset_tag VARCHAR(100) DEFAULT '',
  location_on_premise VARCHAR(255) DEFAULT '',
  installation_date DATE,
  installed_by_technician_id INTEGER REFERENCES technicians(id) ON DELETE SET NULL,
  warranty_expires_at DATE,
  maintenance_interval_months INTEGER DEFAULT 6,
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  specifications JSONB DEFAULT '{}',
  notes TEXT DEFAULT '',
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DO $$ BEGIN
  ALTER TABLE client_devices ADD CONSTRAINT check_device_status 
    CHECK (status IN ('active', 'needs_maintenance', 'under_repair', 'decommissioned', 'spare'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_client_devices_company_id ON client_devices(company_id);
CREATE INDEX IF NOT EXISTS idx_client_devices_status ON client_devices(status);
CREATE INDEX IF NOT EXISTS idx_client_devices_next_maintenance ON client_devices(next_maintenance_date);
CREATE INDEX IF NOT EXISTS idx_client_devices_serial_number ON client_devices(serial_number);

CREATE TABLE IF NOT EXISTS maintenance_logs (
  id SERIAL PRIMARY KEY,
  device_id INTEGER NOT NULL REFERENCES client_devices(id) ON DELETE CASCADE,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  technician_id INTEGER REFERENCES technicians(id) ON DELETE SET NULL,
  incident_id INTEGER REFERENCES incidents(id) ON DELETE SET NULL,
  maintenance_type VARCHAR(50) NOT NULL DEFAULT 'routine_preventive',
  status VARCHAR(50) NOT NULL DEFAULT 'completed',
  performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  summary VARCHAR(255) NOT NULL,
  details TEXT DEFAULT '',
  parts_replaced TEXT DEFAULT '',
  device_status_after VARCHAR(50) DEFAULT 'operational',
  next_recommended_maintenance DATE,
  cost NUMERIC(10,2) DEFAULT 0,
  notes TEXT DEFAULT '',
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DO $$ BEGIN
  ALTER TABLE maintenance_logs ADD CONSTRAINT check_maintenance_type 
    CHECK (maintenance_type IN ('routine_preventive', 'repair_corrective', 'inspection', 'firmware_update', 'installation', 'decommission'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE maintenance_logs ADD CONSTRAINT check_maintenance_status 
    CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_maintenance_logs_device_id ON maintenance_logs(device_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_company_id ON maintenance_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_performed_at ON maintenance_logs(performed_at DESC);
