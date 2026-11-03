"use client";

import { useState } from "react";
import type { Company, DemoSection, ProductSummary } from "@/lib/db";
import { useProductSelection } from "./ProductSelectionContext";
import { trackEvent } from "@/lib/analytics";

const INDUSTRIES = [
  "Agriculture / Farming / Cooperative",
  "Healthcare / Hospital / Clinic",
  "Education / School / University",
  "Manufacturing / Production",
  "Retail / Distribution",
  "NGO / Nonprofit",
  "Real Estate / Property",
  "Government / Public Sector",
  "Financial Services",
  "Other",
];

const DEFAULT_CHECKLIST = [
  "Live 30-minute personalised walkthrough",
  "Tailored to your industry and business size",
  "Response within 1 business day",
  "No contracts, no hidden pressure",
  "Nairobi-based team — we can visit you",
];

const TIME_SLOTS = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"];

function minBookableDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function maxBookableDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split("T")[0];
}

function isWeekend(dateStr: string): boolean {
  const day = new Date(dateStr + "T00:00:00").getDay();
  return day === 0 || day === 6;
}

export default function DemoForm({
  company,
  allProducts,
  section,
}: {
  company: Company;
  allProducts: ProductSummary[];
  section?: DemoSection;
}) {
  const checklist = section?.checklist?.length ? section.checklist : DEFAULT_CHECKLIST;
  const { selected, setSelected } = useProductSelection();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    industry: "",
    message: "",
    preferredDate: "",
    preferredTime: "",
  });
  const [dateError, setDateError] = useState("");
  const [status, setStatus] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [sending, setSending] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const setDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDateError(value && isWeekend(value) ? "We're open Mon–Fri — please pick a weekday." : "");
    setForm((f) => ({ ...f, preferredDate: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const missing: string[] = [];
    if (!form.name.trim()) missing.push("your name");
    if (!form.email.trim() && !form.phone.trim()) missing.push("an email or phone number");
    if (!form.company.trim()) missing.push("your company");
    if (!selected) missing.push("a product");
    if (missing.length) {
      setStatus({ kind: "err", text: `Please add ${missing.join(", ")}.` });
      return;
    }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setStatus({ kind: "err", text: "Please check your email address." });
      return;
    }
    if (form.preferredDate && isWeekend(form.preferredDate)) {
      setDateError("We're open Mon–Fri — please pick a weekday.");
      return;
    }
    setSending(true);
    setStatus(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          company: form.company.trim(),
          interest: `Demo request: ${selected || "General"} — ${form.industry || ""}`,
          message: form.message.trim() || "(no message)",
          preferredDate: form.preferredDate || undefined,
          preferredTime: form.preferredTime || undefined,
        }),
      });
      if (!res.ok) throw new Error();
      trackEvent("generate_lead", {
        category: "Lead Generation",
        label: selected || "General Demo Request",
        industry: form.industry || "Not Specified",
      });
      setStatus({
        kind: "ok",
        text: section?.successMessage || "✓ Request received! Our team will reach out within 1 business day.",
      });
      setForm({ name: "", email: "", phone: "", company: "", industry: "", message: "", preferredDate: "", preferredTime: "" });
      setSelected("");
    } catch {
      setStatus({
        kind: "err",
        text: section?.errorMessage || `Something went wrong — call us directly on ${company.phone || "0734 818 350"}.`,
      });
    }
    setSending(false);
  };

  return (
    <section className="section" id="demo">
      <div className="container">
        <div className="demo-wrap" data-reveal>
          <div className="demo-left">
            <div className="label">{section?.label || "Book a Demo"}</div>
            <h2>{section?.heading || "See Nanosoft in your business — free, no pressure"}</h2>
            <p>
              {section?.subhead ||
                "We show you exactly the product that fits your business, live. Every question answered on the spot. No sales scripts."}
            </p>
            <div className="demo-checks">
              {checklist.map((c, i) => (
                <div className="dc" key={i}>
                  <div className="dc-icon">✓</div>
                  {c}
                </div>
              ))}
            </div>
          </div>

          <div className="demo-form-wrap">
            <h3>{section?.formHeading || "Request your free demo"}</h3>
            <form onSubmit={submit} noValidate>
              <div className="df-row">
                <div className="df-g">
                  <label>Full Name *</label>
                  <input type="text" placeholder="Your name" required value={form.name} onChange={set("name")} />
                </div>
                <div className="df-g">
                  <label>Email</label>
                  <input type="email" placeholder="you@company.com" value={form.email} onChange={set("email")} />
                </div>
              </div>
              <div className="df-row">
                <div className="df-g">
                  <label>Phone</label>
                  <input type="tel" placeholder="+254 700 000 000" value={form.phone} onChange={set("phone")} />
                </div>
                <div className="df-g">
                  <label>Company *</label>
                  <input type="text" placeholder="Company name" required value={form.company} onChange={set("company")} />
                </div>
              </div>
              <div className="df-row">
                <div className="df-g df-full">
                  <label>Which product interests you? *</label>
                  <select value={selected} onChange={(e) => setSelected(e.target.value)}>
                    <option value="">Select a product…</option>
                    {allProducts.map((p) => (
                      <option key={p.id}>{p.name}</option>
                    ))}
                    <option>Other / Not sure yet</option>
                  </select>
                </div>
              </div>
              <p className="df-hint" style={{ fontSize: 12, margin: "-4px 0 12px", opacity: 0.75 }}>
                * Required. Give us an email or a phone number, whichever you prefer.
              </p>
              <details className="df-more" style={{ marginBottom: 12 }}>
                <summary style={{ cursor: "pointer", fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
                  Add more details (optional)
                </summary>
                <div className="df-row">
                  <div className="df-g df-full">
                    <label>Industry</label>
                    <select value={form.industry} onChange={set("industry")}>
                      <option value="">Select your industry…</option>
                      {INDUSTRIES.map((i) => (
                        <option key={i}>{i}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="df-row">
                  <div className="df-g">
                    <label>Preferred date</label>
                    <input
                      type="date"
                      min={minBookableDate()}
                      max={maxBookableDate()}
                      value={form.preferredDate}
                      onChange={setDate}
                    />
                    {dateError && <span className="df-err">{dateError}</span>}
                  </div>
                  <div className="df-g">
                    <label>Preferred time</label>
                    <select value={form.preferredTime} onChange={set("preferredTime")}>
                      <option value="">Select a time…</option>
                      {TIME_SLOTS.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="df-row">
                  <div className="df-g df-full">
                    <label>Anything to tell us?</label>
                    <textarea
                      placeholder="Briefly describe what you need or the challenge you want to solve…"
                      value={form.message}
                      onChange={set("message")}
                    />
                  </div>
                </div>
              </details>
              <button
                type="submit"
                className="btn-demo-submit"
                disabled={sending}
                data-analytics-event="submit_demo_form"
                data-analytics-category="Lead Generation"
                data-analytics-label="Book Free Demo Form"
              >
                {sending ? "Sending…" : section?.submitLabel || "Book My Free Demo →"}
              </button>
              {status && <div className={`form-msg ${status.kind}`}>{status.text}</div>}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
