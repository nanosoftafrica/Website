"use client";

import { useState } from "react";
import { waNumber } from "@/lib/whatsapp";
import ServiceInquiryModal from "./ServiceInquiryModal";
import { trackEvent } from "@/lib/analytics";

interface ProductShareBarProps {
  product: {
    id: number;
    name: string;
    slug?: string;
    subtitle?: string;
    description?: string;
    features?: string[];
  };
  phone?: string;
}

export default function ProductShareBar({ product, phone = "+254734818350" }: ProductShareBarProps) {
  const [copied, setCopied] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Derive current URL safely
  const productUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://ntlafrica.com/products/${product.slug || ""}`;

  // WhatsApp Pre-filled Inquiry Link
  const cleanPhone = phone.replace(/\D/g, "");
  const directInquiryText = `Hello Nanosoft! I would like to inquire about *${product.name}*.\nCould you please share pricing, implementation timeline, and technical specs?\n\nLink: ${productUrl}`;
  const directWaUrl = `https://wa.me/${waNumber(cleanPhone)}?text=${encodeURIComponent(directInquiryText)}`;

  // Share to WhatsApp message format
  const shareText = `*Nanosoft Technologies — ${product.name}*\n${product.subtitle || ""}\n\nKey Highlights:\n${(product.features || [])
    .slice(0, 3)
    .map((f) => `• ${f}`)
    .join("\n")}\n\nView details & request quote: ${productUrl}`;
  const shareWaUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  // Share via Email
  const mailSubject = `Inquiry / Solution Overview: ${product.name}`;
  const mailBody = `Hi,\n\nI'm looking into ${product.name} from Nanosoft Technologies.\n\n${product.description || ""}\n\nCheck out the full specifications and brochure here: ${productUrl}`;
  const mailUrl = `mailto:?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;

  // QR code URL using standard QR image generator
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=12&data=${encodeURIComponent(
    productUrl
  )}`;

  function handleCopy() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(productUrl);
      setCopied(true);
      trackEvent("share_product_copy_link", {
        category: "Share",
        label: product.name,
      });
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <div style={{ marginTop: 24, padding: "18px 20px", background: "rgba(0, 150, 214, 0.05)", borderRadius: 12, border: "1px solid rgba(0, 150, 214, 0.15)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#0096d6" }}>
            Inquire & Share This Solution
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginTop: 2 }}>
            Connected directly to our WhatsApp engineering team
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            className="adm-btn adm-btn-primary"
            onClick={() => {
              trackEvent("open_service_inquiry_modal", { category: "Inquiries", label: product.name });
              setShowInquiryModal(true);
            }}
            style={{ fontWeight: 700, display: "inline-flex", gap: 6, alignItems: "center", background: "#0096d6", color: "#fff" }}
          >
            <span>📋</span> Request Service / Quote
          </button>
          <a
            href={directWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="adm-btn"
            style={{
              background: "#10b981",
              borderColor: "#10b981",
              color: "#ffffff",
              fontWeight: 700,
              display: "inline-flex",
              gap: 6,
              alignItems: "center",
            }}
            data-analytics-event="contact_whatsapp"
            data-analytics-category="Product Inquiry"
            data-analytics-label={product.name}
          >
            <span>💬</span> Inquire on WhatsApp
          </a>
        </div>
      </div>

      {/* Shareable Links Strip */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", paddingTop: 12, borderTop: "1px dashed rgba(0,0,0,0.1)", fontSize: 13 }}>
        <span style={{ color: "#64748b", fontWeight: 600, fontSize: 12 }}>Share:</span>

        {/* WhatsApp Share */}
        <a
          href={shareWaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="adm-btn adm-btn-sm"
          style={{ display: "inline-flex", gap: 5, alignItems: "center", color: "#047857" }}
          data-analytics-event="share_whatsapp"
          data-analytics-category="Share"
          data-analytics-label={product.name}
        >
          <span>💬</span> Send via WhatsApp
        </a>

        {/* Copy Link */}
        <button
          type="button"
          className="adm-btn adm-btn-sm"
          onClick={handleCopy}
          style={{ display: "inline-flex", gap: 5, alignItems: "center" }}
        >
          <span>{copied ? "✓" : "🔗"}</span> {copied ? "Copied!" : "Copy Link"}
        </button>

        {/* Email Share */}
        <a
          href={mailUrl}
          className="adm-btn adm-btn-sm"
          style={{ display: "inline-flex", gap: 5, alignItems: "center" }}
          data-analytics-event="share_email"
          data-analytics-category="Share"
          data-analytics-label={product.name}
        >
          <span>✉️</span> Email
        </a>

        {/* QR Code */}
        <button
          type="button"
          className="adm-btn adm-btn-sm"
          onClick={() => setShowQrModal(true)}
          style={{ display: "inline-flex", gap: 5, alignItems: "center" }}
        >
          <span>📱</span> Mobile QR Code
        </button>
      </div>

      {/* Service Inquiry Modal */}
      {showInquiryModal && (
        <ServiceInquiryModal
          productName={product.name}
          productSlug={product.slug}
          onClose={() => setShowInquiryModal(false)}
        />
      )}

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="pd-modal-backdrop" style={{ zIndex: 9999 }} onClick={() => setShowQrModal(false)}>
          <div
            className="pd-modal"
            style={{ maxWidth: 360, background: "#ffffff", borderRadius: 14, padding: 24, textAlign: "center", color: "#0f1b2d" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 700 }}>Scan with Phone</h3>
            <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px" }}>
              Scan to view <strong>{product.name}</strong> or inquire on WhatsApp.
            </p>
            <div style={{ background: "#f8fafc", padding: 12, borderRadius: 10, display: "inline-block", border: "1px solid #e2e8f0", marginBottom: 16 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrCodeUrl} alt="Product QR Code" style={{ width: 220, height: 220, display: "block" }} />
            </div>
            <div>
              <button type="button" className="adm-btn adm-btn-sm" onClick={() => setShowQrModal(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
