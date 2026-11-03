"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import MediaPicker from "./MediaPicker";
import QuillEditor from "./QuillEditor";
import UndoLastSave from "./UndoLastSave";

/* eslint-disable @typescript-eslint/no-explicit-any */

function slugify(name: string): string {
  return String(name || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const BLOCK_TYPES = [
  { value: "hero", label: "Hero" },
  { value: "richtext", label: "Rich text" },
  { value: "image", label: "Image" },
  { value: "cta", label: "Call to action" },
];

function blankBlock(type: string): any {
  switch (type) {
    case "hero":
      return { type, heading: "", subheading: "", ctaText: "", ctaHref: "", image: null };
    case "richtext":
      return { type, html: "" };
    case "image":
      return { type, url: "", caption: "", alt: "" };
    case "cta":
      return { type, heading: "", text: "", buttonText: "", buttonHref: "" };
    default:
      return { type };
  }
}

function BlockEditor({ block, onChange }: { block: any; onChange: (b: any) => void }) {
  const update = (patch: Record<string, any>) => onChange({ ...block, ...patch });

  if (block.type === "hero") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="adm-field">
          <label>Heading</label>
          <input value={block.heading || ""} onChange={(e) => update({ heading: e.target.value })} />
        </div>
        <div className="adm-field">
          <label>Subheading</label>
          <input value={block.subheading || ""} onChange={(e) => update({ subheading: e.target.value })} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div className="adm-field">
            <label>CTA text</label>
            <input value={block.ctaText || ""} onChange={(e) => update({ ctaText: e.target.value })} />
          </div>
          <div className="adm-field">
            <label>CTA link</label>
            <input value={block.ctaHref || ""} onChange={(e) => update({ ctaHref: e.target.value })} />
          </div>
        </div>
        <MediaPicker label="Image" value={block.image} onChange={(url) => update({ image: url })} />
      </div>
    );
  }

  if (block.type === "richtext") {
    return (
      <div className="adm-field">
        <label>Content</label>
        <QuillEditor value={block.html || ""} onChange={(html) => update({ html })} />
      </div>
    );
  }

  if (block.type === "image") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <MediaPicker label="Image" value={block.url} onChange={(url) => update({ url })} />
        <div className="adm-field">
          <label>Caption</label>
          <input value={block.caption || ""} onChange={(e) => update({ caption: e.target.value })} />
        </div>
        <div className="adm-field">
          <label>Alt text</label>
          <input value={block.alt || ""} onChange={(e) => update({ alt: e.target.value })} />
        </div>
      </div>
    );
  }

  if (block.type === "cta") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="adm-field">
          <label>Heading</label>
          <input value={block.heading || ""} onChange={(e) => update({ heading: e.target.value })} />
        </div>
        <div className="adm-field">
          <label>Text</label>
          <textarea value={block.text || ""} onChange={(e) => update({ text: e.target.value })} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div className="adm-field">
            <label>Button text</label>
            <input value={block.buttonText || ""} onChange={(e) => update({ buttonText: e.target.value })} />
          </div>
          <div className="adm-field">
            <label>Button link</label>
            <input value={block.buttonHref || ""} onChange={(e) => update({ buttonHref: e.target.value })} />
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default function PageEditor({ initialPage }: { initialPage: any | null }) {
  const router = useRouter();
  const isNew = !initialPage;
  const initial = initialPage;
  // Unpublished draft edits, if any, are what the form starts from.
  const src = initialPage ? { ...initialPage, ...(initialPage.draftData || {}) } : null;
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(initialPage?.draftData?.savedAt || null);
  const [title, setTitle] = useState(src?.title || "");
  const [slug, setSlug] = useState(src?.slug || "");
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [status, setStatus] = useState(initialPage?.status || "draft");
  const [seoTitle, setSeoTitle] = useState(src?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(src?.seoDescription || "");
  const [ogImage, setOgImage] = useState<string | null>(src?.ogImage || null);
  const [blocks, setBlocks] = useState<any[]>(src?.blocks || []);
  const [addType, setAddType] = useState("richtext");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleTitleChange(v: string) {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  function addBlock() {
    setBlocks((prev) => [...prev, blankBlock(addType)]);
  }
  function updateBlock(i: number, block: any) {
    setBlocks((prev) => prev.map((b, idx) => (idx === i ? block : b)));
  }
  function removeBlock(i: number) {
    setBlocks((prev) => prev.filter((_, idx) => idx !== i));
  }
  function moveBlock(i: number, dir: number) {
    setBlocks((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const arr = [...prev];
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return arr;
    });
  }

  function payloadNow() {
    return { title, slug, status, seoTitle, seoDescription, ogImage, blocks };
  }

  // Saves the form as a draft beside the page (visitors keep seeing the
  // published version), then optionally opens the preview.
  async function saveDraft(openPreview: boolean) {
    if (isNew) return;
    const win = openPreview ? window.open("about:blank", "_blank") : null;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/pages/${initial.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payloadNow(), saveAs: "draft" }),
      });
      const data = await res.json();
      if (!res.ok) {
        win?.close();
        setError(data.error || "Couldn't save the draft");
        return;
      }
      setDraftSavedAt(data.draftData?.savedAt || new Date().toISOString());
      if (win) win.location.href = `/${initial.slug}?preview=1`;
    } catch {
      win?.close();
      setError("Network error — please try again");
    } finally {
      setSaving(false);
    }
  }

  async function discardDraft() {
    if (isNew || !confirm("Throw away the unpublished draft and go back to the published version?")) return;
    const res = await fetch(`/api/admin/pages/${initial.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payloadNow(), saveAs: "discard" }),
    });
    if (res.ok) window.location.reload();
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = payloadNow();
    const url = isNew ? "/api/admin/pages" : `/api/admin/pages/${initialPage.id}`;
    const method = isNew ? "POST" : "PUT";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Save failed");
        setSaving(false);
        return;
      }
      router.push(`/admin/pages?saved=${encodeURIComponent(String(data.id ?? ""))}`);
      router.refresh();
    } catch {
      setError("Network error — please try again");
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="adm-h1">{isNew ? "New page" : "Edit page"}</h1>
      {error && <p className="adm-error">{error}</p>}
      {draftSavedAt && (
        <p className="adm-panel" data-testid="draft-notice" style={{ padding: "10px 14px", background: "#FEF3C7", color: "#78350F", fontSize: 13 }}>
          {initial?.status === "published"
            ? "You're editing an unpublished draft. Visitors still see the published version until you save the page."
            : "You're editing a saved draft."}{" "}
          (Draft saved {new Date(draftSavedAt).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" })}.){" "}
          <button type="button" className="adm-btn adm-btn-sm" onClick={discardDraft}>Discard draft</button>
        </p>
      )}
      <form onSubmit={handleSave}>
        <div className="adm-panel" style={{ padding: 20, marginBottom: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 14 }}>
            <div className="adm-field">
              <label>Title *</label>
              <input value={title} required onChange={(e) => handleTitleChange(e.target.value)} />
            </div>
            <div className="adm-field">
              <label>Slug</label>
              <input
                value={slug}
                placeholder="auto-generated if blank"
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugTouched(true);
                }}
              />
            </div>
            <div className="adm-field">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="adm-field">
              <label>SEO title</label>
              <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
            </div>
            <div className="adm-field">
              <label>SEO description</label>
              <input value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} />
            </div>
          </div>
          <MediaPicker label="OG image" value={ogImage} onChange={setOgImage} />
        </div>

        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Blocks ({blocks.length})</h2>
        {blocks.map((block, i) => (
          <div key={i} className="adm-panel" style={{ padding: 16, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span className="adm-badge adm-badge-active" style={{ textTransform: "capitalize" }}>
                {block.type}
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                <button type="button" className="adm-btn adm-btn-sm" onClick={() => moveBlock(i, -1)} disabled={i === 0}>
                  ↑
                </button>
                <button
                  type="button"
                  className="adm-btn adm-btn-sm"
                  onClick={() => moveBlock(i, 1)}
                  disabled={i === blocks.length - 1}
                >
                  ↓
                </button>
                <button type="button" className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => removeBlock(i)}>
                  Remove
                </button>
              </div>
            </div>
            <BlockEditor block={block} onChange={(b) => updateBlock(i, b)} />
          </div>
        ))}

        <div className="adm-panel" style={{ padding: 16, marginBottom: 20, display: "flex", gap: 10, alignItems: "center" }}>
          <select value={addType} onChange={(e) => setAddType(e.target.value)}>
            {BLOCK_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <button type="button" className="adm-btn adm-btn-sm" onClick={addBlock}>
            + Add block
          </button>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" className="adm-btn" onClick={() => router.push("/admin/pages")}>
            Cancel
          </button>
          <UndoLastSave entity="page" id={initial?.id} onUndone={() => window.location.reload()} />
          <button
            type="button"
            className="adm-btn"
            onClick={() => saveDraft(true)}
            disabled={saving || isNew}
            title={isNew ? "Save the page once, then you can preview it" : "See it as visitors would, without publishing"}
            data-testid="preview-btn"
          >
            Preview
          </button>
          {!isNew && (
            <button type="button" className="adm-btn" onClick={() => saveDraft(false)} disabled={saving} data-testid="save-draft-btn">
              Save draft
            </button>
          )}
          <button type="submit" className="adm-btn adm-btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save page"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* eslint-enable @typescript-eslint/no-explicit-any */
