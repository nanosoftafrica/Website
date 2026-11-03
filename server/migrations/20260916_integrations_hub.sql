-- System Integrations Hub Migration
-- Date: September 16, 2026
-- Purpose: Store runtime-configurable integrations (WAHA, SMTP Email, Africa's Talking SMS, Notification Routing)

CREATE TABLE IF NOT EXISTS system_integrations (
  id SERIAL PRIMARY KEY,
  key VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  config JSONB NOT NULL DEFAULT '{}',
  last_tested_at TIMESTAMP,
  test_status VARCHAR(50) DEFAULT 'untested',
  test_message TEXT DEFAULT '',
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_system_integrations_key ON system_integrations(key);

-- Fresh-DB fix (2026-11-03): if sequelize.sync() created this table first, its timestamp
-- columns have no default; give them one so the seed INSERT below works. No-op otherwise.
ALTER TABLE system_integrations ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE system_integrations ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- Seed default integration placeholders if not existing
INSERT INTO system_integrations (key, name, is_enabled, config, test_status, test_message)
VALUES 
  ('waha', 'WhatsApp HTTP API (WAHA)', true, '{"baseUrl":"http://localhost:2000","apiKey":"","session":"default","salesWhatsAppPhone":"254734818350","autoReplyClient":true,"alertSalesTeam":true}', 'untested', 'Initialized with default settings'),
  ('smtp', 'Email / SMTP Service', true, '{"host":"localhost","port":587,"secure":false,"user":"","password":"","fromName":"Nanosoft Technology","fromEmail":"info@ntlafrica.com","salesEmail":"sales@ntlafrica.com","alertSalesTeam":true}', 'untested', 'Initialized with default settings'),
  ('sms', 'Africa''s Talking SMS Gateway', false, '{"provider":"africastalking","username":"sandbox","apiKey":"","senderId":"","alertSalesTeam":false}', 'untested', 'Initialized with default settings'),
  ('notifications', 'Inquiry & Alert Routing Rules', true, '{"salesWhatsAppPhone":"254734818350","salesEmail":"sales@ntlafrica.com","clientAutoReplyTemplate":"Hi {name}, thank you for inquiring about {product}! Our solutions team at Nanosoft Technology has received your request and will follow up shortly."}', 'untested', 'Default routing rules active')
ON CONFLICT (key) DO NOTHING;
