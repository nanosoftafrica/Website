-- Remove WAHA credentials and obsolete WhatsApp notification settings.
DELETE FROM system_integrations WHERE key = 'waha';

UPDATE system_integrations
SET config = config - 'salesWhatsAppPhone' - 'clientAutoReplyTemplate'
WHERE key = 'notifications';