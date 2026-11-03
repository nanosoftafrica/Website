"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import StatusPulse from "@/components/reactbits/StatusPulse";
import type { WahaStatusResponse } from "@/lib/wahaService";

interface ContactLite {
  id: number;
  name: string;
  phone?: string;
  companyId?: number;
}

interface WhatsAppHubProps {
  initialStatus: WahaStatusResponse;
  initialMessages: any[];
  contacts: ContactLite[];
  prefilledPhone?: string;
  prefilledContactId?: number;
}

export default function WhatsAppHub({
  initialStatus,
  initialMessages,
  contacts,
  prefilledPhone = "",
  prefilledContactId,
}: WhatsAppHubProps) {
  const [status, setStatus] = useState<WahaStatusResponse>(initialStatus);
  const [messages, setMessages] = useState<any[]>(initialMessages);
  const [phone, setPhone] = useState(prefilledPhone);
  const [selectedContactId, setSelectedContactId] = useState<number | undefined>(prefilledContactId);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Poll status every 12 seconds
  useEffect(() => {
    const timer = setInterval(fetchStatus, 12000);
    return () => clearInterval(timer);
  }, []);

  async function fetchStatus() {
    try {
      const res = await fetch("/api/admin/whatsapp/status");
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch {
      // offline fallback
    }
  }

  async function fetchMessages() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/whatsapp/messages");
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } finally {
      setRefreshing(false);
    }
  }

  function handleSelectContact(contactId: number) {
    setSelectedContactId(contactId);
    const c = contacts.find((item) => item.id === contactId);
    if (c && c.phone) {
      setPhone(c.phone);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim() || !text.trim()) return;

    setSending(true);
    setToast(null);

    try {
      const res = await fetch("/api/admin/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.trim(),
          text: text.trim(),
          contactId: selectedContactId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setToast({ message: data.error || "Failed to send WhatsApp message", type: "error" });
      } else {
        setToast({
          message: data.simulated
            ? "Message logged in simulated/offline mode (WAHA offline)"
            : "Message dispatched via WhatsApp!",
          type: "success",
        });
        setText("");
        fetchMessages();
      }
    } catch {
      setToast({ message: "Network failure sending WhatsApp message", type: "error" });
    } finally {
      setSending(false);
    }
  }

  const filteredMessages = messages.filter((m) => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return (
      m.phone?.toLowerCase().includes(q) ||
      m.body?.toLowerCase().includes(q) ||
      m.contactName?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 className="adm-h1">WhatsApp Hub (WAHA)</h1>
          <p className="adm-sub">Direct WhatsApp communication with CRM leads, clients, and technical teams.</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            type="button"
            onClick={fetchStatus}
            className="adm-btn adm-btn-sm"
            title="Refresh WhatsApp gateway status"
          >
            🔄 Check Gateway
          </button>
          <button
            type="button"
            onClick={fetchMessages}
            disabled={refreshing}
            className="adm-btn adm-btn-sm"
          >
            {refreshing ? "Refreshing..." : "Refresh Chat Log"}
          </button>
        </div>
      </div>

      {/* ── Gateway Telemetry Bar ── */}
      <div
        style={{
          background: "#fff",
          border: "1px solid var(--adm-border)",
          borderRadius: 12,
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <StatusPulse
            status={status.connected ? "online" : status.status === "SCAN_QR_CODE" ? "warning" : "offline"}
            size="md"
          />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>
                Status: {status.connected ? "Active & Linked" : status.status}
              </span>
              {status.phone && (
                <span style={{ fontSize: 12, color: "#10b981", fontWeight: 600 }}>
                  ({status.phone})
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: "var(--adm-muted)", marginTop: 2 }}>
              Gateway: <span style={{ fontFamily: "monospace" }}>{status.baseUrl}</span> · Session:{" "}
              <span style={{ fontFamily: "monospace" }}>{status.session}</span>
            </div>
          </div>
        </div>

        {/* QR Code Warning if in SCAN_QR_CODE mode */}
        {status.status === "SCAN_QR_CODE" && (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12, color: "#c2410c", fontWeight: 600 }}>
              Action Required: Scan QR code with WhatsApp on your phone
            </span>
            {status.qrCode && (
              <a
                href={status.qrCode}
                target="_blank"
                rel="noreferrer"
                className="adm-btn adm-btn-sm adm-btn-primary"
              >
                View QR Code
              </a>
            )}
          </div>
        )}

        {/* Info when offline */}
        {!status.connected && status.status === "OFFLINE" && (
          <div style={{ fontSize: 12, color: "var(--adm-muted)", maxWidth: 500 }}>
            ℹ️ WAHA service offline. Messages will be recorded in CRM log. To connect live:{" "}
            <code>docker run -p 2000:2000 devlikeapro/waha</code>
          </div>
        )}
      </div>

      {/* ── Main Chat & Composer Container ── */}
      <div className="wa-chat-container">
        {/* Left Column: Message Composer */}
        <div className="wa-sidebar" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px" }}>Compose WhatsApp Message</h2>

          <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
            {/* Quick Contact Selector */}
            <div className="adm-field" style={{ margin: 0 }}>
              <label className="adm-label">Select CRM Contact (Optional)</label>
              <select
                className="adm-select"
                value={selectedContactId || ""}
                onChange={(e) => handleSelectContact(Number(e.target.value))}
              >
                <option value="">-- Choose existing contact --</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.phone ? `(${c.phone})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Recipient Phone */}
            <div className="adm-field" style={{ margin: 0 }}>
              <label className="adm-label">Recipient Phone Number</label>
              <input
                type="text"
                className="adm-input"
                placeholder="e.g. 0734818350 or 254734818350"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <span style={{ fontSize: 11, color: "var(--adm-muted)", marginTop: 4 }}>
                Kenyan 07... numbers automatically format with +254.
              </span>
            </div>

            {/* Message Body */}
            <div className="adm-field" style={{ margin: 0, flex: 1, display: "flex", flexDirection: "column" }}>
              <label className="adm-label">Message Content</label>
              <textarea
                className="adm-input"
                style={{ flex: 1, minHeight: 120, resize: "vertical" }}
                placeholder="Type your WhatsApp message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--adm-muted)", marginTop: 4 }}>
                <span>Standard WhatsApp formatting (*bold*, _italic_) supported.</span>
                <span>{text.length} chars</span>
              </div>
            </div>

            {/* Business Templates */}
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--adm-muted)", display: "block", marginBottom: 6 }}>
                Quick Templates
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                <button
                  type="button"
                  className="wa-template-pill"
                  onClick={() => setText("Hello! Thank you for inquiring with Nanosoft Technologies. We are preparing your solution overview and will share details shortly.")}
                >
                  🚀 Demo Intro
                </button>
                <button
                  type="button"
                  className="wa-template-pill"
                  onClick={() => setText("Hi! We have dispatched our technical engineer to assist with your service request. We'll update you as soon as they arrive on site.")}
                >
                  🔧 Tech Dispatch
                </button>
                <button
                  type="button"
                  className="wa-template-pill"
                  onClick={() => setText("Greetings from Nanosoft. Following up regarding our proposal discussion. Please let us know if you'd like to schedule a quick call.")}
                >
                  💼 Proposal Follow-up
                </button>
                <button
                  type="button"
                  className="wa-template-pill"
                  onClick={() => setText("Friendly reminder from Nanosoft Technologies regarding your account invoice. Please let us know if you need another copy sent over.")}
                >
                  💳 Invoice Notice
                </button>
              </div>
            </div>

            {toast && (
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: 6,
                  fontSize: 12,
                  background: toast.type === "success" ? "#ecfdf5" : "#fef2f2",
                  color: toast.type === "success" ? "#047857" : "#b91c1c",
                }}
              >
                {toast.message}
              </div>
            )}

            <button
              type="submit"
              disabled={sending}
              className="adm-btn adm-btn-primary"
              style={{ padding: "10px 16px", fontWeight: 700 }}
            >
              {sending ? "Sending via WhatsApp..." : "Send WhatsApp Message"}
            </button>
          </form>
        </div>

        {/* Right Column: Chat & Message Log */}
        <div className="wa-chat-area">
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--adm-border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#fafbfc",
            }}
          >
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Message Log & History</h2>
              <span style={{ fontSize: 12, color: "var(--adm-muted)" }}>
                {messages.length} total logged communications
              </span>
            </div>

            <input
              type="text"
              className="adm-input"
              style={{ maxWidth: 220, fontSize: 12, padding: "6px 10px" }}
              placeholder="Filter by phone or text..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
            />
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 20,
              display: "flex",
              flexDirection: "column",
              background: "#f8fafc",
            }}
          >
            {filteredMessages.length > 0 ? (
              filteredMessages.map((msg) => {
                const isOutbound = msg.direction === "outbound";
                return (
                  <div
                    key={msg.id}
                    className={`wa-message-bubble ${isOutbound ? "wa-bubble-outbound" : "wa-bubble-inbound"}`}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 12, color: isOutbound ? "#065f46" : "#1e293b" }}>
                        {isOutbound ? "Outgoing to" : "Incoming from"}: {msg.contactName || msg.phone}
                      </span>
                      <span style={{ fontSize: 10, opacity: 0.7 }}>
                        {new Date(msg.created_at || msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <div style={{ whiteSpace: "pre-wrap" }}>{msg.body}</div>

                    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 6, marginTop: 4 }}>
                      <span style={{ fontSize: 10, opacity: 0.7 }}>
                        {new Date(msg.created_at || msg.createdAt).toLocaleDateString()}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          color: msg.status === "delivered" ? "#059669" : msg.status === "received" ? "#2563eb" : "#d97706",
                        }}
                      >
                        ✓ {msg.status}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--adm-muted)" }}>
                <span style={{ fontSize: 32, display: "block", marginBottom: 10 }}>💬</span>
                <p style={{ margin: 0, fontSize: 14 }}>No WhatsApp messages recorded yet.</p>
                <p style={{ margin: "4px 0 0", fontSize: 12 }}>
                  Use the composer on the left to send your first message to a lead or client.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
