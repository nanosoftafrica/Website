"use client";

import UndoLastSave from "./UndoLastSave";
import { useState, type ReactNode } from "react";
import ViewOnSiteNotice, { type SavedNotice } from "./ViewOnSiteNotice";
import MediaPicker from "./MediaPicker";

/* eslint-disable @typescript-eslint/no-explicit-any */

function Repeater({
  items,
  onChange,
  renderItem,
  blank,
  addLabel,
}: {
  items: any[];
  onChange: (items: any[]) => void;
  renderItem: (item: any, update: (patch: Record<string, any>) => void) => ReactNode;
  blank: Record<string, any>;
  addLabel: string;
}) {
  function update(i: number, patch: Record<string, any>) {
    const arr = [...items];
    arr[i] = { ...arr[i], ...patch };
    onChange(arr);
  }
  function remove(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }
  function move(i: number, dir: number) {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const arr = [...items];
    [arr[i], arr[j]] = [arr[j], arr[i]];
    onChange(arr);
  }
  function add() {
    onChange([...items, { ...blank }]);
  }

  return (
    <div>
      {items.map((item, i) => (
        <div key={i} className="adm-panel" style={{ padding: 14, marginBottom: 10 }}>
          {renderItem(item, (patch) => update(i, patch))}
          <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
            <button type="button" className="adm-btn adm-btn-sm" onClick={() => move(i, -1)} disabled={i === 0}>
              ↑
            </button>
            <button type="button" className="adm-btn adm-btn-sm" onClick={() => move(i, 1)} disabled={i === items.length - 1}>
              ↓
            </button>
            <button type="button" className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => remove(i)}>
              Remove
            </button>
          </div>
        </div>
      ))}
      <button type="button" className="adm-btn adm-btn-sm" onClick={add}>
        {addLabel}
      </button>
    </div>
  );
}

// Every homepage section (About, Pain, Products, How it works, Testimonials,
// Insights) shares the same eyebrow-label / heading / subhead shape — one
// small reusable field group instead of repeating the same three inputs in
// six different panels.
function SectionHeaderFields({
  value,
  onChange,
  withSubhead = true,
}: {
  value: { label?: string; heading?: string; subhead?: string };
  onChange: (patch: Record<string, any>) => void;
  withSubhead?: boolean;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
      <div className="adm-field">
        <label>Eyebrow label</label>
        <input value={value.label || ""} onChange={(e) => onChange({ label: e.target.value })} />
      </div>
      <div className="adm-field">
        <label>Heading</label>
        <input value={value.heading || ""} onChange={(e) => onChange({ heading: e.target.value })} />
      </div>
      {withSubhead && (
        <div className="adm-field" style={{ gridColumn: "1 / -1" }}>
          <label>Subheading</label>
          <textarea value={value.subhead || ""} onChange={(e) => onChange({ subhead: e.target.value })} />
        </div>
      )}
    </div>
  );
}

export default function SiteContentEditor({ initialContent, contentId }: { initialContent: any; contentId?: number }) {
  const [content, setContent] = useState<any>(initialContent);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [notice, setNotice] = useState<SavedNotice | null>(null);
  const [error, setError] = useState("");

  function updateHero(key: string, value: any) {
    setContent((prev: any) => ({ ...prev, hero: { ...prev.hero, [key]: value } }));
  }
  function updateCompany(key: string, value: any) {
    setContent((prev: any) => ({ ...prev, company: { ...prev.company, [key]: value } }));
  }
  function updateSeo(key: string, value: any) {
    setContent((prev: any) => ({ ...prev, seo: { ...prev.seo, [key]: value } }));
  }
  function updateSection(section: string, patch: Record<string, any>) {
    setContent((prev: any) => ({
      ...prev,
      sections: { ...prev.sections, [section]: { ...(prev.sections || {})[section], ...patch } },
    }));
  }

  async function handleSaveAll() {
    setSaving(true);
    setError("");
    setSavedMsg("");
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Save failed");
        return;
      }
      setSavedMsg("Saved.");
      setNotice({ label: "Your home page changes are live.", href: "/" });
      setTimeout(() => setSavedMsg(""), 2500);
    } catch {
      setError("Network error — please try again");
    } finally {
      setSaving(false);
    }
  }

  const company = content.company || {};
  const hero = content.hero || {};
  const seo = content.seo || {};
  const services = content.services || [];
  const clients = content.clients || [];
  const processSteps = content.processSteps || [];
  const sections = content.sections || {};
  const demo = sections.demo || {};
  const footerSection = sections.footer || {};

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h1 className="adm-h1" style={{ marginBottom: 0 }}>
          Home page
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {savedMsg && <span style={{ color: "var(--adm-success)", fontSize: 13, fontWeight: 600 }}>{savedMsg}</span>}
          <UndoLastSave entity="content" id={contentId} refreshKey={savedMsg} onUndone={(item) => { setContent(item); setNotice({ label: "The home page is back to how it was before your last save.", href: "/" }); }} />
          <button className="adm-btn adm-btn-primary" onClick={handleSaveAll} disabled={saving}>
            {saving ? "Saving…" : "Save all"}
          </button>
        </div>
      </div>
      <ViewOnSiteNotice notice={notice} onClose={() => setNotice(null)} />
      {error && <p className="adm-error">{error}</p>}

      <section className="adm-panel" style={{ padding: 20, marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>Hero</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="adm-field">
            <label>Eyebrow pill text</label>
            <input value={hero.eyebrow || ""} onChange={(e) => updateHero("eyebrow", e.target.value)} />
          </div>
          <div />
          <div className="adm-field">
            <label>Headline (line 1)</label>
            <input value={hero.headlineMain || ""} onChange={(e) => updateHero("headlineMain", e.target.value)} />
          </div>
          <div className="adm-field">
            <label>Headline emphasis (after &quot;without the&quot;)</label>
            <input value={hero.headlineEmphasis || ""} onChange={(e) => updateHero("headlineEmphasis", e.target.value)} />
          </div>
          <div className="adm-field" style={{ gridColumn: "1 / -1" }}>
            <label>Subheading</label>
            <textarea value={hero.subhead || ""} onChange={(e) => updateHero("subhead", e.target.value)} />
          </div>
          <div className="adm-field">
            <label>Primary CTA label</label>
            <input value={hero.ctaPrimaryLabel || ""} onChange={(e) => updateHero("ctaPrimaryLabel", e.target.value)} />
          </div>
          <div className="adm-field">
            <label>Secondary CTA label</label>
            <input value={hero.ctaSecondaryLabel || ""} onChange={(e) => updateHero("ctaSecondaryLabel", e.target.value)} />
          </div>
        </div>
        <MediaPicker label="Banner image" value={hero.bannerImage} onChange={(url) => updateHero("bannerImage", url)} />
      </section>

      <section className="adm-panel" style={{ padding: 20, marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>Company</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <MediaPicker label="Logo" value={company.logo} onChange={(url) => updateCompany("logo", url)} />
          <div className="adm-field">
            <label>Name</label>
            <input value={company.name || ""} onChange={(e) => updateCompany("name", e.target.value)} />
          </div>
          <div className="adm-field">
            <label>Tagline</label>
            <input value={company.tagline || ""} onChange={(e) => updateCompany("tagline", e.target.value)} />
          </div>
          <div className="adm-field">
            <label>Founded year</label>
            <input
              type="number"
              value={company.foundedYear ?? ""}
              onChange={(e) => updateCompany("foundedYear", e.target.value ? Number(e.target.value) : null)}
            />
          </div>
          <div className="adm-field">
            <label>Businesses served</label>
            <input
              value={company.businessesServed || ""}
              onChange={(e) => updateCompany("businessesServed", e.target.value)}
              placeholder="e.g. 1000+"
            />
          </div>
          <div className="adm-field">
            <label>Team size</label>
            <input
              value={company.teamSize || ""}
              onChange={(e) => updateCompany("teamSize", e.target.value)}
              placeholder="e.g. 50+"
            />
          </div>
        </div>
        <div className="adm-field">
          <label>About</label>
          <textarea value={company.about || ""} onChange={(e) => updateCompany("about", e.target.value)} />
        </div>
        <div className="adm-field">
          <label>Mission</label>
          <textarea value={company.mission || ""} onChange={(e) => updateCompany("mission", e.target.value)} />
        </div>
        <div className="adm-field">
          <label>Vision</label>
          <textarea value={company.vision || ""} onChange={(e) => updateCompany("vision", e.target.value)} />
        </div>
        <div className="adm-field">
          <label>Core values (one per line)</label>
          <textarea
            value={(company.values || []).join("\n")}
            onChange={(e) => updateCompany("values", e.target.value.split("\n"))}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="adm-field">
            <label>Address</label>
            <input value={company.address || ""} onChange={(e) => updateCompany("address", e.target.value)} />
          </div>
          <div className="adm-field">
            <label>Phone</label>
            <input value={company.phone || ""} onChange={(e) => updateCompany("phone", e.target.value)} />
          </div>
          <div className="adm-field">
            <label>Email</label>
            <input value={company.email || ""} onChange={(e) => updateCompany("email", e.target.value)} />
          </div>
          <div className="adm-field">
            <label>Hours</label>
            <input value={company.hours || ""} onChange={(e) => updateCompany("hours", e.target.value)} />
          </div>
          <div className="adm-field">
            <label>Facebook</label>
            <input value={company.facebook || ""} onChange={(e) => updateCompany("facebook", e.target.value)} />
          </div>
          <div className="adm-field">
            <label>LinkedIn</label>
            <input value={company.linkedin || ""} onChange={(e) => updateCompany("linkedin", e.target.value)} />
          </div>
          <div className="adm-field">
            <label>Instagram</label>
            <input value={company.instagram || ""} onChange={(e) => updateCompany("instagram", e.target.value)} />
          </div>
        </div>
      </section>

      <section className="adm-panel" style={{ padding: 20, marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>Who We Are (About section)</h2>
        <SectionHeaderFields value={sections.about || {}} onChange={(patch) => updateSection("about", patch)} withSubhead={false} />
        <p style={{ fontSize: 12, color: "var(--adm-muted)", marginTop: -4, marginBottom: 14 }}>
          Leave heading blank to auto-generate &quot;N+ Years Serving Kenyan Businesses&quot; from the founded year below. Body
          paragraph is the Company → About field.
        </p>
        <MediaPicker
          label="About section image (shown beside the About text on the homepage)"
          value={company.aboutImage}
          onChange={(url) => updateCompany("aboutImage", url)}
        />
      </section>

      <section className="adm-panel" style={{ padding: 20, marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>Why Nanosoft (Services section header)</h2>
        <SectionHeaderFields value={sections.pain || {}} onChange={(patch) => updateSection("pain", patch)} />
      </section>

      <section className="adm-panel" style={{ padding: 20, marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>Services ({services.length})</h2>
        <Repeater
          items={services}
          onChange={(arr) => setContent((prev: any) => ({ ...prev, services: arr }))}
          blank={{ icon: "", title: "", description: "", solve: "", image: null }}
          addLabel="+ Add service"
          renderItem={(item, update) => (
            <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 10 }}>
              <div className="adm-field">
                <label>Icon</label>
                <input value={item.icon || ""} onChange={(e) => update({ icon: e.target.value })} />
              </div>
              <div className="adm-field">
                <label>Title</label>
                <input value={item.title || ""} onChange={(e) => update({ title: e.target.value })} />
              </div>
              <div className="adm-field" style={{ gridColumn: "1 / -1" }}>
                <label>Description</label>
                <textarea value={item.description || ""} onChange={(e) => update({ description: e.target.value })} />
              </div>
              <div className="adm-field" style={{ gridColumn: "1 / -1" }}>
                <label>Problem it solves</label>
                <textarea value={item.solve || ""} onChange={(e) => update({ solve: e.target.value })} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <MediaPicker
                  label="Visual (optional — falls back to a generated illustration if left blank)"
                  value={item.image}
                  onChange={(url) => update({ image: url })}
                />
              </div>
            </div>
          )}
        />
      </section>

      <section className="adm-panel" style={{ padding: 20, marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>Clients ({clients.length})</h2>
        <div className="adm-field" style={{ marginBottom: 14 }}>
          <label>Strip label</label>
          <input
            value={sections.clients?.label || ""}
            onChange={(e) => updateSection("clients", { label: e.target.value })}
          />
        </div>
        <Repeater
          items={clients}
          onChange={(arr) => setContent((prev: any) => ({ ...prev, clients: arr }))}
          blank={{ name: "", logo: null, info: "" }}
          addLabel="+ Add client"
          renderItem={(item, update) => (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div className="adm-field">
                <label>Name</label>
                <input value={item.name || ""} onChange={(e) => update({ name: e.target.value })} />
              </div>
              <MediaPicker label="Logo" value={item.logo} onChange={(url) => update({ logo: url })} />
              <div className="adm-field" style={{ gridColumn: "1 / -1" }}>
                <label>Info (optional — industry, e.g. &quot;Logistics &amp; Haulage&quot;)</label>
                <input value={item.info || ""} onChange={(e) => update({ info: e.target.value })} />
              </div>
            </div>
          )}
        />
      </section>

      <section className="adm-panel" style={{ padding: 20, marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>Testimonials section header</h2>
        <p style={{ fontSize: 12, color: "var(--adm-muted)", marginTop: -4, marginBottom: 14 }}>
          Testimonial items themselves are managed on the Testimonials page.
        </p>
        <SectionHeaderFields
          value={sections.testimonials || {}}
          onChange={(patch) => updateSection("testimonials", patch)}
          withSubhead={false}
        />
      </section>

      <section className="adm-panel" style={{ padding: 20, marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>What We Offer (Products section header)</h2>
        <p style={{ fontSize: 12, color: "var(--adm-muted)", marginTop: -4, marginBottom: 14 }}>
          Categories and products themselves are managed on the Categories and Products pages.
        </p>
        <SectionHeaderFields value={sections.products || {}} onChange={(patch) => updateSection("products", patch)} />
      </section>

      <section className="adm-panel" style={{ padding: 20, marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>How it works ({processSteps.length})</h2>
        <SectionHeaderFields value={sections.how || {}} onChange={(patch) => updateSection("how", patch)} />
        <Repeater
          items={processSteps}
          onChange={(arr) => setContent((prev: any) => ({ ...prev, processSteps: arr }))}
          blank={{ number: "", icon: "", title: "", description: "", image: null }}
          addLabel="+ Add step"
          renderItem={(item, update) => (
            <div style={{ display: "grid", gridTemplateColumns: "60px 60px 1fr", gap: 10 }}>
              <div className="adm-field">
                <label>Step #</label>
                <input value={item.number || ""} onChange={(e) => update({ number: e.target.value })} />
              </div>
              <div className="adm-field">
                <label>Icon</label>
                <input value={item.icon || ""} onChange={(e) => update({ icon: e.target.value })} />
              </div>
              <div className="adm-field">
                <label>Title</label>
                <input value={item.title || ""} onChange={(e) => update({ title: e.target.value })} />
              </div>
              <div className="adm-field" style={{ gridColumn: "1 / -1" }}>
                <label>Description</label>
                <textarea value={item.description || ""} onChange={(e) => update({ description: e.target.value })} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <MediaPicker
                  label="Photo (optional — replaces the icon with a circular photo)"
                  value={item.image}
                  onChange={(url) => update({ image: url })}
                />
              </div>
            </div>
          )}
        />
      </section>

      <section className="adm-panel" style={{ padding: 20, marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>Insights (Blog section header)</h2>
        <p style={{ fontSize: 12, color: "var(--adm-muted)", marginTop: -4, marginBottom: 14 }}>
          Posts themselves are managed on the Posts page. Section is hidden automatically if there are no published posts.
        </p>
        <SectionHeaderFields
          value={sections.insights || {}}
          onChange={(patch) => updateSection("insights", patch)}
          withSubhead={false}
        />
      </section>

      <section className="adm-panel" style={{ padding: 20, marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>Book a Demo section</h2>
        <SectionHeaderFields value={demo} onChange={(patch) => updateSection("demo", patch)} />
        <div className="adm-field">
          <label>Checklist (one per line)</label>
          <textarea
            value={(demo.checklist || []).join("\n")}
            onChange={(e) => updateSection("demo", { checklist: e.target.value.split("\n") })}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="adm-field">
            <label>Form heading</label>
            <input value={demo.formHeading || ""} onChange={(e) => updateSection("demo", { formHeading: e.target.value })} />
          </div>
          <div className="adm-field">
            <label>Submit button label</label>
            <input value={demo.submitLabel || ""} onChange={(e) => updateSection("demo", { submitLabel: e.target.value })} />
          </div>
          <div className="adm-field" style={{ gridColumn: "1 / -1" }}>
            <label>Success message</label>
            <input
              value={demo.successMessage || ""}
              onChange={(e) => updateSection("demo", { successMessage: e.target.value })}
            />
          </div>
          <div className="adm-field" style={{ gridColumn: "1 / -1" }}>
            <label>Error message</label>
            <input value={demo.errorMessage || ""} onChange={(e) => updateSection("demo", { errorMessage: e.target.value })} />
          </div>
        </div>
      </section>

      <section className="adm-panel" style={{ padding: 20, marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>Footer</h2>
        <div className="adm-field">
          <label>Tagline (fallback — Company → Tagline takes priority if set)</label>
          <input value={footerSection.tagline || ""} onChange={(e) => updateSection("footer", { tagline: e.target.value })} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="adm-field">
            <label>Products column heading</label>
            <input
              value={footerSection.productsHeading || ""}
              onChange={(e) => updateSection("footer", { productsHeading: e.target.value })}
            />
          </div>
          <div className="adm-field">
            <label>Company column heading</label>
            <input
              value={footerSection.companyHeading || ""}
              onChange={(e) => updateSection("footer", { companyHeading: e.target.value })}
            />
          </div>
        </div>
      </section>

      <section className="adm-panel" style={{ padding: 20, marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>SEO</h2>
        <div className="adm-field">
          <label>Title</label>
          <input value={seo.title || ""} onChange={(e) => updateSeo("title", e.target.value)} />
        </div>
        <div className="adm-field">
          <label>Description</label>
          <textarea value={seo.description || ""} onChange={(e) => updateSeo("description", e.target.value)} />
        </div>
        <div className="adm-field">
          <label>Canonical URL</label>
          <input value={seo.canonical || ""} onChange={(e) => updateSeo("canonical", e.target.value)} />
        </div>
        <div className="adm-field">
          <label>Keywords</label>
          <input value={seo.keywords || ""} onChange={(e) => updateSeo("keywords", e.target.value)} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="adm-field">
            <label>Google Analytics 4 Measurement ID (e.g. G-XXXXXXXXXX)</label>
            <input
              placeholder="G-XXXXXXXXXX"
              value={seo.googleAnalyticsId || ""}
              onChange={(e) => updateSeo("googleAnalyticsId", e.target.value)}
            />
          </div>
          <div className="adm-field">
            <label>Google Tag Manager ID (Optional, e.g. GTM-XXXXXXX)</label>
            <input
              placeholder="GTM-XXXXXXX"
              value={seo.googleTagManagerId || ""}
              onChange={(e) => updateSeo("googleTagManagerId", e.target.value)}
            />
          </div>
        </div>
        <MediaPicker label="OG image" value={seo.ogImage} onChange={(url) => updateSeo("ogImage", url)} />
      </section>
    </div>
  );
}

/* eslint-enable @typescript-eslint/no-explicit-any */
