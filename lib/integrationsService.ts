/**
 * Centralized Integrations Management Service
 * Manages runtime credentials, connection tests, and notification routing for WAHA, SMTP, and SMS.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from "nodemailer";
import { waNumber } from "@/lib/whatsapp";
import { SystemIntegration, Activity } from "./serverModels";
import { sendWhatsAppMessage, formatPhoneNumberForWhatsApp } from "./wahaService";
import { sendSMS } from "./smsService";

export interface IntegrationRecord {
  key: string;
  name: string;
  isEnabled: boolean;
  config: Record<string, any>;
  lastTestedAt?: string | null;
  testStatus?: string;
  testMessage?: string;
}

// In-memory short-lived cache for high performance
let cache: { data: Record<string, IntegrationRecord>; timestamp: number } | null = null;
const CACHE_TTL_MS = 10_000;

export async function getIntegration(key: string): Promise<IntegrationRecord | null> {
  const now = Date.now();
  if (cache && now - cache.timestamp < CACHE_TTL_MS && cache.data[key]) {
    return cache.data[key];
  }

  try {
    const item = await SystemIntegration.findOne({ where: { key } });
    if (!item) return null;
    return item.toJSON() as IntegrationRecord;
  } catch {
    return null;
  }
}

export async function listIntegrations(maskSensitive = true): Promise<IntegrationRecord[]> {
  try {
    const rows = await SystemIntegration.findAll({ order: [["id", "ASC"]] });
    const items = rows.map((r: any) => r.toJSON() as IntegrationRecord);

    if (maskSensitive) {
      return items.map((item: IntegrationRecord) => {
        const cfg = { ...item.config };
        if (cfg.apiKey) cfg.apiKey = maskSecret(cfg.apiKey);
        if (cfg.password) cfg.password = maskSecret(cfg.password);
        return { ...item, config: cfg };
      });
    }

    return items;
  } catch {
    return [];
  }
}

function maskSecret(str: string): string {
  if (!str) return "";
  if (str.length <= 4) return "••••";
  return str.slice(0, 2) + "••••••••" + str.slice(-2);
}

export async function updateIntegration(
  key: string,
  patch: { isEnabled?: boolean; config?: Record<string, any> }
): Promise<IntegrationRecord> {
  const item = await SystemIntegration.findOne({ where: { key } });
  if (!item) throw new Error(`Integration '${key}' not found`);

  // Merge config without overwriting masked passwords if user didn't change them
  let newConfig = { ...item.config, ...(patch.config || {}) };
  if (patch.config) {
    if (patch.config.password && patch.config.password.includes("••••")) {
      newConfig.password = item.config.password;
    }
    if (patch.config.apiKey && patch.config.apiKey.includes("••••")) {
      newConfig.apiKey = item.config.apiKey;
    }
  }

  const updates: Record<string, any> = {};
  if (patch.isEnabled !== undefined) updates.isEnabled = patch.isEnabled;
  if (patch.config) updates.config = newConfig;

  await item.update(updates);
  cache = null; // Invalidate cache
  return item.toJSON();
}

/**
 * Live test of an integration configuration
 */
export async function testIntegration(
  key: string,
  targetRecipient?: string
): Promise<{ success: boolean; message: string }> {
  const item = await SystemIntegration.findOne({ where: { key } });
  if (!item) return { success: false, message: "Integration record not found" };

  const config = item.config || {};
  let result = { success: false, message: "" };

  if (key === "waha") {
    const baseUrl = (config.baseUrl || process.env.WAHA_BASE_URL || "http://localhost:2000").replace(/\/$/, "");
    const apiKey = config.apiKey || process.env.WAHA_API_KEY || "";
    const session = config.session || process.env.WAHA_DEFAULT_SESSION || "default";

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (apiKey) headers["X-Api-Key"] = apiKey;

      const res = await fetch(`${baseUrl}/api/sessions`, { headers, signal: AbortSignal.timeout(4000) });
      if (!res.ok) {
        result = { success: false, message: `WAHA returned HTTP status ${res.status}` };
      } else {
        const sessions = await res.json().catch(() => []);
        const target = Array.isArray(sessions) ? sessions.find((s: any) => s.name === session) : null;
        if (target && target.status === "WORKING") {
          result = { success: true, message: `Connected! Session '${session}' is active (${target.me?.id || "Authenticated"}).` };
        } else if (target) {
          result = { success: true, message: `WAHA online. Session '${session}' status is ${target.status}.` };
        } else {
          result = { success: true, message: `WAHA reachable at ${baseUrl}. Session '${session}' not yet initialized.` };
        }
      }
    } catch (err) {
      result = { success: false, message: `Failed to reach WAHA at ${baseUrl}: ${(err as Error).message}` };
    }
  } else if (key === "smtp") {
    const host = config.host || process.env.SMTP_HOST || "localhost";
    const port = parseInt(config.port || process.env.SMTP_PORT || "587");
    const secure = config.secure ?? (process.env.SMTP_SECURE === "true");
    const user = config.user || process.env.SMTP_USER || "";
    const pass = config.password || process.env.SMTP_PASSWORD || "";

    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: user && pass ? { user, pass } : undefined,
      });

      await transporter.verify();

      if (targetRecipient) {
        await transporter.sendMail({
          from: `"${config.fromName || "Nanosoft Technologies"}" <${config.fromEmail || "info@ntlafrica.com"}>`,
          to: targetRecipient,
          subject: "Test Email — Nanosoft Technologies Integration Hub",
          text: "This is a test email confirming that your SMTP settings in Nanosoft Technologies are configured correctly.",
        });
        result = { success: true, message: `SMTP verified successfully! Sent test email to ${targetRecipient}.` };
      } else {
        result = { success: true, message: `SMTP server verified successfully (${host}:${port}). Ready for dispatch.` };
      }
    } catch (err) {
      result = { success: false, message: `SMTP verification failed: ${(err as Error).message}` };
    }
  } else if (key === "sms") {
    const username = config.username || process.env.AT_USERNAME || "sandbox";
    const apiKey = config.apiKey || process.env.AT_API_KEY || "";
    const senderId = config.senderId || process.env.AT_SENDER_ID || "";
    const testTo = targetRecipient || config.salesPhone || "+254734818350";

    const smsRes = await sendSMS({
      to: testTo,
      message: "Test SMS from Nanosoft Technologies Integrations Hub.",
      username,
      apiKey,
      senderId,
    });

    result = {
      success: smsRes.success,
      message: smsRes.success
        ? `SMS gateway verified (${smsRes.status})! ${smsRes.simulated ? "[Simulated Mode]" : `Message ID: ${smsRes.messageId}`}`
        : `SMS failed: ${smsRes.error || smsRes.status}`,
    };
  } else {
    result = { success: true, message: "Rule configuration updated." };
  }

  await item.update({
    lastTestedAt: new Date(),
    testStatus: result.success ? "success" : "failed",
    testMessage: result.message,
  });

  return result;
}

/**
 * Dispatches automated notifications across WhatsApp, Email, and SMS for new product/service inquiries
 */
export async function dispatchServiceInquiryNotifications({
  clientName,
  clientPhone,
  clientEmail,
  companyName,
  productName,
  requirements,
  dealId,
  contactId,
}: {
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  companyName?: string;
  productName: string;
  requirements?: string;
  dealId: number;
  contactId?: number;
}) {
  const [wahaInt, smtpInt, notifInt] = await Promise.all([
    getIntegration("waha"),
    getIntegration("smtp"),
    getIntegration("notifications"),
  ]);

  const notifConfig = notifInt?.config || {};
  const salesPhone = notifConfig.salesWhatsAppPhone || wahaInt?.config?.salesWhatsAppPhone || "254734818350";
  const salesEmail = notifConfig.salesEmail || smtpInt?.config?.salesEmail || "sales@ntlafrica.com";

  // 1. Automated WAHA WhatsApp Message to Client
  if (clientPhone) {
    const template =
      notifConfig.clientAutoReplyTemplate ||
      "Hi {name}, thank you for inquiring about {product}! Our solutions team at Nanosoft Technologies has received your request (Ref: #DEAL-{dealId}) and will follow up shortly.";

    const clientMsg = template
      .replace(/\{name\}/g, clientName)
      .replace(/\{product\}/g, productName)
      .replace(/\{dealId\}/g, String(dealId));

    try {
      await sendWhatsAppMessage({
        phone: clientPhone,
        text: clientMsg,
        contactId,
      });
    } catch (err) {
      console.warn("Could not dispatch client auto-reply via WAHA:", (err as Error).message);
    }
  }

  // 2. Alert Message to Sales Person's WhatsApp
  if (salesPhone) {
    const salesMsg = `🔥 *New Product Inquiry Received:*\n\n` +
      `• *Client:* ${clientName}\n` +
      `• *Company:* ${companyName || "Individual / Not specified"}\n` +
      `• *Product:* ${productName}\n` +
      `• *Phone:* ${clientPhone}\n` +
      `• *Email:* ${clientEmail || "Not provided"}\n` +
      `• *Requirements:* ${requirements || "General product inquiry"}\n` +
      `• *Pipeline Ref:* Deal #${dealId}\n\n` +
      `👉 View in CRM: /admin/deals`;

    try {
      await sendWhatsAppMessage({
        phone: salesPhone,
        text: salesMsg,
      });
    } catch (err) {
      console.warn("Could not alert sales team via WAHA:", (err as Error).message);
    }
  }

  // 3. Alert Email to Sales Person's Mail
  if (salesEmail && smtpInt?.isEnabled) {
    try {
      const cfg = smtpInt.config || {};
      const host = cfg.host || process.env.SMTP_HOST || "localhost";
      const port = parseInt(cfg.port || process.env.SMTP_PORT || "587");
      const secure = cfg.secure ?? (process.env.SMTP_SECURE === "true");
      const user = cfg.user || process.env.SMTP_USER || "";
      const pass = cfg.password || process.env.SMTP_PASSWORD || "";

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: user && pass ? { user, pass } : undefined,
      });

      await transporter.sendMail({
        from: `"${cfg.fromName || "Nanosoft Inquiries"}" <${cfg.fromEmail || "info@ntlafrica.com"}>`,
        to: salesEmail,
        subject: `[New Lead] Inquiry for ${productName} — ${clientName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; line-height: 1.6; color: #1e293b;">
            <div style="background: #0f1b2d; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h2 style="color: #ffffff; margin: 0; font-size: 20px;">New Service Inquiry (Deal #${dealId})</h2>
            </div>
            <div style="padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; background: #ffffff;">
              <p>A prospective client just requested information for <strong>${productName}</strong>.</p>
              <table style="width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 14px;">
                <tr><td style="padding: 8px 0; color: #64748b;">Client Name:</td><td><strong>${clientName}</strong></td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;">Company:</td><td><strong>${companyName || "N/A"}</strong></td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;">WhatsApp / Phone:</td><td><a href="tel:${clientPhone}">${clientPhone}</a></td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;">Email:</td><td><a href="mailto:${clientEmail}">${clientEmail || "N/A"}</a></td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;">Product/Service:</td><td><strong>${productName}</strong></td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;">Requirements:</td><td>${requirements || "General inquiry"}</td></tr>
              </table>
              <div style="margin-top: 24px;">
                <a href="https://wa.me/${waNumber(clientPhone, "")}" style="background: #10b981; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 6px; font-weight: bold; display: inline-block; margin-right: 10px;">
                  💬 Open WhatsApp Chat
                </a>
              </div>
            </div>
          </div>
        `,
      });
    } catch (err) {
      console.warn("Could not dispatch sales alert email:", (err as Error).message);
    }
  }
}
