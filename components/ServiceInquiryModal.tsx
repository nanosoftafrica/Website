"use client";

import { useState, type FormEvent } from "react";
import { trackEvent } from "@/lib/analytics";

interface ServiceInquiryModalProps {
  productName: string;
  productSlug?: string;
  onClose: () => void;
}

export default function ServiceInquiryModal({
  productName,
  productSlug,
  onClose,
}: ServiceInquiryModalProps) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [requirements, setRequirements] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; dealId?: number; message?: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/service-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          company,
          phone,
          email,
          productName,
          productSlug,
          requirements,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to submit inquiry");
        return;
      }

      trackEvent("request_service_inquiry", {
        category: "Inquiries",
        label: productName,
        company,
      });

      setResult(data);
    } catch {
      setErrorMsg("Network error. Please try again or reach us on WhatsApp directly.");
    } finally {
      setSending(false);
    }
  }

  const directWaUrl = `https://wa.me/254734818350?text=${encodeURIComponent(
    `Hello Nanosoft! I just submitted an inquiry for ${productName}${result?.dealId ? ` (Ref: #${result.dealId})` : ""}. I'd love to discuss details.`
  )}`;

  return (
    <div className="pd-modal-backdrop" style={{ zIndex: 9999 }} onClick={onClose}>
      <div
        className="pd-modal"
        style={{ maxWidth: 540, background: "#ffffff", borderRadius: 14, overflow: "hidden", color: "#0f1b2d" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Request Service & Inquiry</h3>
            <span style={{ fontSize: 13, color: "#64748b" }}>{productName}</span>
          </div>
          <button
            type="button"
            className="pd-modal-close"
            style={{ position: "static", background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#64748b" }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {result ? (
          <div style={{ padding: 32, textAlign: "center" }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>✅</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px" }}>Inquiry Submitted!</h3>
            <p style={{ fontSize: 14, color: "#475569", marginBottom: 20 }}>
              {result.message}
            </p>
            {result.dealId && (
              <div style={{ background: "#f1f5f9", padding: "10px 16px", borderRadius: 8, fontSize: 13, display: "inline-block", marginBottom: 24 }}>
                Reference ID: <strong>#DEAL-{result.dealId}</strong>
              </div>
            )}
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <a
                href={directWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="adm-btn adm-btn-primary"
                style={{ background: "#10b981", borderColor: "#10b981", display: "inline-flex", gap: 6, alignItems: "center", padding: "10px 18px" }}
              >
                <span>💬</span> Open WhatsApp Chat Now
              </a>
              <button type="button" className="adm-btn" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: "20px 24px" }}>
            {errorMsg && (
              <div style={{ background: "#fee2e2", color: "#991b1b", padding: "10px 14px", borderRadius: 6, marginBottom: 16, fontSize: 13 }}>
                {errorMsg}
              </div>
            )}

            <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px" }}>
              Our team will review your requirements, prepare tailored specifications, and respond immediately via WhatsApp and Email.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "#334155" }}>
                    Your Name *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Samuel Mwangi"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "#334155" }}>
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Logistics Ltd"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13 }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "#334155" }}>
                    WhatsApp / Phone Number *
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="e.g. 0712 345 678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "#334155" }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. samuel@apex.co.ke"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "#334155" }}>
                  Project Scope / Specific Requirements
                </label>
                <textarea
                  rows={3}
                  placeholder="Number of locations/users, installation timeline, or custom software integrations required…"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13 }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                <button type="button" className="adm-btn" onClick={onClose}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="adm-btn adm-btn-primary"
                  disabled={sending}
                  style={{ minWidth: 140 }}
                >
                  {sending ? "Sending..." : "Submit Inquiry →"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
