/**
 * WAHA (WhatsApp HTTP API) Client & Automation Service
 * Handles session status, QR authentication, message dispatch, and CRM logging.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { WhatsAppMessage, Activity, Contact, SystemIntegration } from "./serverModels";

export interface WahaStatusResponse {
  connected: boolean;
  status: "WORKING" | "SCAN_QR_CODE" | "STARTING" | "STOPPED" | "FAILED" | "OFFLINE";
  session: string;
  baseUrl: string;
  qrCode?: string | null;
  message?: string;
  phone?: string | null;
}

export function getWahaConfig() {
  return {
    baseUrl: (process.env.WAHA_BASE_URL || "http://localhost:2000").replace(/\/$/, ""),
    apiKey: process.env.WAHA_API_KEY || "",
    session: process.env.WAHA_DEFAULT_SESSION || "default",
  };
}

export async function resolveWahaConfig() {
  try {
    const item = await SystemIntegration.findOne({ where: { key: "waha" } });
    if (item && item.isEnabled && item.config) {
      return {
        baseUrl: (item.config.baseUrl || process.env.WAHA_BASE_URL || "http://localhost:2000").replace(/\/$/, ""),
        apiKey: item.config.apiKey || process.env.WAHA_API_KEY || "",
        session: item.config.session || process.env.WAHA_DEFAULT_SESSION || "default",
      };
    }
  } catch {
    // Fall back to env
  }
  return getWahaConfig();
}

/**
 * Normalizes phone numbers to WhatsApp international format (e.g. 254712345678)
 */
export function formatPhoneNumberForWhatsApp(phone: string): { cleanPhone: string; chatId: string } {
  // Remove all non-digits
  let digits = phone.replace(/\D/g, "");

  // Kenyan number normalization if starts with 0 (e.g., 0712345678 -> 254712345678)
  if (digits.startsWith("0") && digits.length === 10) {
    digits = "254" + digits.substring(1);
  }

  // If starts with + (removed) or standard international, ensure valid
  return {
    cleanPhone: digits,
    chatId: `${digits}@c.us`,
  };
}

/**
 * Check WAHA health and session status
 */
export async function getWahaStatus(): Promise<WahaStatusResponse> {
  const { baseUrl, apiKey, session } = await resolveWahaConfig();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (apiKey) headers["X-Api-Key"] = apiKey;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    // Try fetching sessions list
    const res = await fetch(`${baseUrl}/api/sessions`, {
      headers,
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return {
        connected: false,
        status: "OFFLINE",
        session,
        baseUrl,
        message: `WAHA returned HTTP ${res.status}`,
      };
    }

    const sessions = await res.json();
    const current = Array.isArray(sessions) ? sessions.find((s: any) => s.name === session) : null;

    if (!current) {
      return {
        connected: false,
        status: "STOPPED",
        session,
        baseUrl,
        message: `Session '${session}' not initialized in WAHA.`,
      };
    }

    let qrCode: string | null = null;
    if (current.status === "SCAN_QR_CODE") {
      try {
        const qrRes = await fetch(`${baseUrl}/api/${session}/auth/qr`, { headers, cache: "no-store" });
        if (qrRes.ok) {
          const qrData = await qrRes.json();
          qrCode = qrData.qr || qrData.image || null;
        }
      } catch {
        // QR fetch optional
      }
    }

    return {
      connected: current.status === "WORKING",
      status: current.status || "WORKING",
      session,
      baseUrl,
      qrCode,
      phone: current.me?.id ? current.me.id.split("@")[0] : null,
    };
  } catch {
    return {
      connected: false,
      status: "OFFLINE",
      session,
      baseUrl,
      message: `WAHA service is offline at ${baseUrl}. (Run 'docker run -p 2000:2000 devlikeapro/waha' to enable live WhatsApp gateway)`,
    };
  }
}

/**
 * Dispatch an outbound WhatsApp message and persist to database & activity timeline
 */
export async function sendWhatsAppMessage(params: {
  phone: string;
  text: string;
  contactId?: number | null;
  adminUsername?: string;
}): Promise<{ ok: boolean; message: any; simulated: boolean; error?: string }> {
  const { phone, text, contactId, adminUsername = "system" } = params;
  if (!phone || !text.trim()) {
    throw new Error("Phone number and message text are required");
  }

  const { cleanPhone, chatId } = formatPhoneNumberForWhatsApp(phone);
  const { baseUrl, apiKey, session } = await resolveWahaConfig();

  let wahaMessageId: string | null = null;
  let simulated = false;
  let status = "sent";

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (apiKey) headers["X-Api-Key"] = apiKey;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${baseUrl}/api/sendText`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        session,
        chatId,
        text: text.trim(),
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      wahaMessageId = data.id || data.messageId || null;
      status = "delivered";
    } else {
      // If WAHA responded with an error, record as simulated / offline log
      simulated = true;
      status = "sent (offline simulated)";
    }
  } catch {
    // WAHA offline or timed out
    simulated = true;
    status = "sent (offline simulated)";
  }

  // Persist to whatsapp_messages table
  const record = await WhatsAppMessage.create({
    chatId,
    phone: cleanPhone,
    contactId: contactId || null,
    direction: "outbound",
    body: text.trim(),
    status,
    wahaMessageId,
  });

  // If linked to contact, log CRM activity entry
  if (contactId) {
    try {
      await Activity.create({
        type: "whatsapp",
        subject: `WhatsApp: ${text.trim().substring(0, 40)}${text.length > 40 ? "..." : ""}`,
        body: text.trim(),
        contactId,
        createdBy: adminUsername,
      });
    } catch {
      // Activity log non-fatal
    }
  }

  return {
    ok: true,
    message: record.toJSON(),
    simulated,
  };
}

/**
 * Retrieve recent WhatsApp message logs
 */
export async function listWhatsAppMessages(limit = 40) {
  const rows = await WhatsAppMessage.findAll({
    order: [["created_at", "DESC"]],
    limit,
  });

  const contactIds = [...new Set(rows.map((r: any) => r.contactId).filter(Boolean))];
  const contacts = contactIds.length ? await Contact.findAll({ where: { id: contactIds } }) : [];
  const contactMap = Object.fromEntries(contacts.map((c: any) => [c.id, `${c.firstName} ${c.lastName}`.trim()]));

  return rows.map((r: any) => ({
    ...r.toJSON(),
    contactName: r.contactId ? contactMap[r.contactId] || null : null,
  }));
}
