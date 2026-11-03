"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import MediaPicker from "./MediaPicker";
import QuillEditor from "./QuillEditor";

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
  const [title, setTitle] = useState(initialPage?.title || "");
  const [slug, setSlug] = useState(initialPage?.slug || "");
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [status, setStatus] = useState(initialPage?.status || "draft");
  const [seoTitle, setSeoTitle] = useState(initialPage?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(initialPage?.seoDescription || "");
  const [ogImage, setOgImage] = useState<string | null>(initialPage?.ogImage || null);
  const [blocks, setBlocks] = useState<any[]>(initialPage?.blocks || []);
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

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = { title, slug, status, seoTitle, seoDescription, ogImage, blocks };
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
      router.push("/admin/pages");
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
          <button type="submit" className="adm-btn adm-btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save page"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* eslint-enable @typescript-eslint/no-explicit-any */
