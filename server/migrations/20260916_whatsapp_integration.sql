-- WhatsApp (WAHA) Integration Migration
-- Date: September 16, 2026
-- Purpose: Store WhatsApp message logs, direction, status, and WAHA references

CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id SERIAL PRIMARY KEY,
  chat_id VARCHAR(100) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
  direction VARCHAR(20) NOT NULL DEFAULT 'outbound',
  body TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'sent',
  waha_message_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_chat_id ON whatsapp_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_contact_id ON whatsapp_messages(contact_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created_at ON whatsapp_messages(created_at DESC);

-- Allow 'whatsapp' in activities enum if enum type exists
DO $$
BEGIN
  ALTER TYPE enum_activities_type ADD VALUE IF NOT EXISTS 'whatsapp';
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;
