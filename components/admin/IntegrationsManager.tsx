"use client";

import { useState } from "react";
import type { IntegrationRecord } from "@/lib/integrationsService";

interface IntegrationsManagerProps {
  initialIntegrations: IntegrationRecord[];
}

export default function IntegrationsManager({ initialIntegrations }: IntegrationsManagerProps) {
  const [integrations, setIntegrations] = useState<IntegrationRecord[]>(initialIntegrations);
  const [activeTab, setActiveTab] = useState<"smtp" | "sms" | "notifications">("smtp");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [toast, setToast] = useState<{ type: "ok" | "err"; message: string } | null>(null);
  const [testRecipient, setTestRecipient] = useState("");

  const current = integrations.find((i) => i.key === activeTab) || {
    key: activeTab,
    name: activeTab.toUpperCase(),
    isEnabled: true,
    config: {},
  };

  function showToast(type: "ok" | "err", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  function updateConfig(key: string, value: any) {
    setIntegrations((prev) =>
      prev.map((item) =>
        item.key === activeTab ? { ...item, config: { ...item.config, [key]: value } } : item
      )
    );
  }

  function toggleEnabled(val: boolean) {
    setIntegrations((prev) =>
      prev.map((item) => (item.key === activeTab ? { ...item, isEnabled: val } : item))
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/integrations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: current.key,
          isEnabled: current.isEnabled,
          config: current.config,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast("err", data.error || "Failed to save configuration");
        return;
      }
      showToast("ok", `Saved ${current.name} configuration successfully.`);
    } catch {
      showToast("err", "Network error while saving");
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    setTesting(true);
    try {
      const res = await fetch("/api/admin/integrations/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: current.key,
          targetRecipient: testRecipient.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast("err", data.error || "Integration test failed");
        return;
      }

      // Update test status locally
      setIntegrations((prev) =>
        prev.map((item) =>
          item.key === current.key
            ? {
                ...item,
                testStatus: data.success ? "success" : "failed",
                testMessage: data.message,
                lastTestedAt: new Date().toISOString(),
              }
            : item
        )
      );

      if (data.success) {
        showToast("ok", data.message);
      } else {
        showToast("err", data.message);
      }
    } catch {
      showToast("err", "Network error during test");
    } finally {
      setTesting(false);
    }
  }

  return (
    <div style={{ paddingBottom: 40, maxWidth: 840 }}>
      {/* Page Title */}
      <div style={{ marginBottom: 24 }}>
        <h1 className="adm-h1" style={{ marginBottom: 4 }}>
          Integrations & Automation Hub
        </h1>
        <p className="adm-sub">
          Configure email, SMS gateways, and inquiry notification routing.
        </p>
      </div>

      {toast && (
        <div
          style={{
            padding: "12px 18px",
            borderRadius: 8,
            marginBottom: 20,
            fontSize: 13,
            fontWeight: 600,
            background: toast.type === "ok" ? "#dcfce7" : "#fee2e2",
            color: toast.type === "ok" ? "#166534" : "#991b1b",
            border: `1px solid ${toast.type === "ok" ? "#86efac" : "#fca5a5"}`,
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--adm-border)", marginBottom: 24, paddingBottom: 2 }}>
        {[
          { key: "smtp", label: "✉️ Email (SMTP)", icon: "✉️" },
          { key: "sms", label: "📱 Africa's Talking SMS", icon: "📱" },
          { key: "notifications", label: "⚙️ Routing Rules", icon: "⚙️" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            className="adm-btn adm-btn-sm"
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              background: activeTab === tab.key ? "var(--adm-primary)" : "transparent",
              color: activeTab === tab.key ? "#ffffff" : "var(--adm-text)",
              fontWeight: activeTab === tab.key ? 700 : 500,
              borderRadius: "6px 6px 0 0",
              border: "1px solid transparent",
              borderColor: activeTab === tab.key ? "var(--adm-primary)" : "transparent",
              padding: "8px 16px",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Settings Panel */}
      <div className="adm-panel" style={{ padding: 24 }}>
        {/* Header & Enabled Toggle */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid var(--adm-border)" }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{current.name}</h2>
            <div style={{ fontSize: 12, color: "var(--adm-muted)", marginTop: 2 }}>
              {current.lastTestedAt ? (
                <span>
                  Last tested: {new Date(current.lastTestedAt).toLocaleString("en-KE")} ·{" "}
                  <strong style={{ color: current.testStatus === "success" ? "#16a34a" : "#dc2626" }}>
                    {current.testStatus?.toUpperCase()}
                  </strong>
                </span>
              ) : (
                "Not tested recently"
              )}
            </div>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={current.isEnabled}
              onChange={(e) => toggleEnabled(e.target.checked)}
            />
            <span>Enabled</span>
          </label>
        </div>

        {/* TAB 1: SMTP EMAIL */}
        {activeTab === "smtp" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
              <div className="adm-field">
                <label>SMTP Host</label>
                <input
                  placeholder="e.g. smtp.gmail.com, mail.ntlafrica.com, localhost"
                  value={current.config.host || ""}
                  onChange={(e) => updateConfig("host", e.target.value)}
                />
              </div>
              <div className="adm-field">
                <label>SMTP Port</label>
                <input
                  type="number"
                  placeholder="587"
                  value={current.config.port || "587"}
                  onChange={(e) => updateConfig("port", e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="adm-field">
                <label>SMTP Username / Email</label>
                <input
                  placeholder="user@example.com"
                  value={current.config.user || ""}
                  onChange={(e) => updateConfig("user", e.target.value)}
                />
              </div>
              <div className="adm-field">
                <label>SMTP Password / App Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={current.config.password || ""}
                  onChange={(e) => updateConfig("password", e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="adm-field">
                <label>From Name</label>
                <input
                  placeholder="Nanosoft Technologies"
                  value={current.config.fromName || ""}
                  onChange={(e) => updateConfig("fromName", e.target.value)}
                />
              </div>
              <div className="adm-field">
                <label>From Email Address</label>
                <input
                  placeholder="info@ntlafrica.com"
                  value={current.config.fromEmail || ""}
                  onChange={(e) => updateConfig("fromEmail", e.target.value)}
                />
              </div>
            </div>

            <div className="adm-field">
              <label>Sales Team Recipient Email (For New Inquiry Alerts)</label>
              <input
                placeholder="sales@ntlafrica.com"
                value={current.config.salesEmail || ""}
                onChange={(e) => updateConfig("salesEmail", e.target.value)}
              />
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
              <input
                type="checkbox"
                checked={current.config.secure ?? false}
                onChange={(e) => updateConfig("secure", e.target.checked)}
              />
              <span>Use SSL/TLS Secure Connection (typically true for port 465, false for port 587/STARTTLS)</span>
            </label>
          </div>
        )}

        {/* TAB 2: AFRICA'S TALKING SMS */}
        {activeTab === "sms" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="adm-field">
                <label>Africa's Talking Username</label>
                <input
                  placeholder="sandbox (or live username)"
                  value={current.config.username || "sandbox"}
                  onChange={(e) => updateConfig("username", e.target.value)}
                />
              </div>
              <div className="adm-field">
                <label>Sender ID (Alphanumeric)</label>
                <input
                  placeholder="e.g. NANOSOFT (leave empty if sandbox)"
                  value={current.config.senderId || ""}
                  onChange={(e) => updateConfig("senderId", e.target.value)}
                />
              </div>
            </div>

            <div className="adm-field">
              <label>Africa's Talking API Key</label>
              <input
                type="password"
                placeholder="Your Africa's Talking API key"
                value={current.config.apiKey || ""}
                onChange={(e) => updateConfig("apiKey", e.target.value)}
              />
              <span style={{ fontSize: 11, color: "var(--adm-muted)" }}>
                Obtained from the Africa's Talking dashboard (sandbox or live production).
              </span>
            </div>

            <div className="adm-field">
              <label>Sales Alert Mobile Number for SMS</label>
              <input
                placeholder="+254734818350"
                value={current.config.salesPhone || "+254734818350"}
                onChange={(e) => updateConfig("salesPhone", e.target.value)}
              />
            </div>
          </div>
        )}

        {/* TAB 3: NOTIFICATION ROUTING */}
        {activeTab === "notifications" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="adm-field">
                <label>Sales Alert Email Address</label>
                <input
                  placeholder="sales@ntlafrica.com"
                  value={current.config.salesEmail || "sales@ntlafrica.com"}
                  onChange={(e) => updateConfig("salesEmail", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Actions & Live Testing */}
        <div style={{ marginTop: 24, paddingTop: 18, borderTop: "1px solid var(--adm-border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {activeTab !== "notifications" && (
              <>
                <input
                  type="text"
                  placeholder={
                    activeTab === "smtp" ? "Test recipient email..." : "Test recipient phone (+254...)..."
                  }
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid var(--adm-border)", fontSize: 12, width: 220 }}
                />
                <button
                  type="button"
                  className="adm-btn adm-btn-sm"
                  disabled={testing}
                  onClick={handleTest}
                >
                  {testing ? "Testing..." : `🧪 Test ${current.name}`}
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            className="adm-btn adm-btn-primary"
            disabled={saving}
            onClick={handleSave}
            style={{ minWidth: 120 }}
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
