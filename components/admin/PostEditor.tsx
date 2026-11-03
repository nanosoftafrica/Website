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

export default function PostEditor({ initialPost }: { initialPost: any | null }) {
  const router = useRouter();
  const isNew = !initialPost;
  const initial = initialPost;
  // Unpublished draft edits, if any, are what the form starts from.
  const draft = initialPost?.draftData || null;
  const src = initialPost ? { ...initialPost, ...(draft || {}) } : null;
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(draft?.savedAt || null);
  const [title, setTitle] = useState(src?.title || "");
  const [slug, setSlug] = useState(src?.slug || "");
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [excerpt, setExcerpt] = useState(src?.excerpt || "");
  const [body, setBody] = useState(src?.body || "");
  const [coverImage, setCoverImage] = useState<string | null>(src?.coverImage || null);
  const [author, setAuthor] = useState(src?.author || "Nanosoft Technologies");
  const [tagNames, setTagNames] = useState(
    typeof draft?.tagNames === "string" ? draft.tagNames : (initialPost?.tags || []).map((t: any) => t.name).join(", ")
  );
  const [status, setStatus] = useState(initialPost?.status || "draft");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleTitleChange(v: string) {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  function payloadNow() {
    return { title, slug, excerpt, body, coverImage, author, tagNames, status };
  }

  // Saves the form as a draft beside the post (visitors keep seeing the
  // published version), then optionally opens the preview.
  async function saveDraft(openPreview: boolean) {
    if (isNew) return;
    const win = openPreview ? window.open("about:blank", "_blank") : null;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/posts/${initial.id}`, {
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
      if (win) win.location.href = `/blog/${initial.slug}?preview=1`;
    } catch {
      win?.close();
      setError("Network error — please try again");
    } finally {
      setSaving(false);
    }
  }

  async function discardDraft() {
    if (isNew || !confirm("Throw away the unpublished draft and go back to the published version?")) return;
    const res = await fetch(`/api/admin/posts/${initial.id}`, {
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
    const url = isNew ? "/api/admin/posts" : `/api/admin/posts/${initialPost.id}`;
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
      router.push(`/admin/posts?saved=${encodeURIComponent(String(data.id ?? ""))}`);
      router.refresh();
    } catch {
      setError("Network error — please try again");
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="adm-h1">{isNew ? "New post" : "Edit post"}</h1>
      {error && <p className="adm-error">{error}</p>}
      {draftSavedAt && (
        <p className="adm-panel" data-testid="draft-notice" style={{ padding: "10px 14px", background: "#FEF3C7", color: "#78350F", fontSize: 13 }}>
          {initial?.status === "published"
            ? "You're editing an unpublished draft. Visitors still see the published version until you save the post."
            : "You're editing a saved draft."}{" "}
          (Draft saved {new Date(draftSavedAt).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" })}.){" "}
          <button type="button" className="adm-btn adm-btn-sm" onClick={discardDraft}>Discard draft</button>
        </p>
      )}
      <form onSubmit={handleSave}>
        <div className="adm-panel" style={{ padding: 20, marginBottom: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
            <div className="adm-field">
              <label>Title *</label>
              <input value={title} required onChange={(e) => handleTitleChange(e.target.value)} />
            </div>
            <div className="adm-field">
              <label>Slug *</label>
              <input
                value={slug}
                required
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugTouched(true);
                }}
              />
            </div>
          </div>
          <div className="adm-field">
            <label>Excerpt</label>
            <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
          </div>
          <div className="adm-field">
            <label>Body</label>
            <QuillEditor value={body} onChange={setBody} />
          </div>
          <MediaPicker label="Cover image" value={coverImage} onChange={setCoverImage} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <div className="adm-field">
              <label>Author</label>
              <input value={author} onChange={(e) => setAuthor(e.target.value)} />
            </div>
            <div className="adm-field">
              <label>Tags (comma-separated)</label>
              <input value={tagNames} onChange={(e) => setTagNames(e.target.value)} placeholder="ERP, Security" />
            </div>
            <div className="adm-field">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" className="adm-btn" onClick={() => router.push("/admin/posts")}>
            Cancel
          </button>
          <UndoLastSave entity="post" id={initial?.id} onUndone={() => window.location.reload()} />
          <button
            type="button"
            className="adm-btn"
            onClick={() => saveDraft(true)}
            disabled={saving || isNew}
            title={isNew ? "Save the post once, then you can preview it" : "See it as visitors would, without publishing"}
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
            {saving ? "Saving…" : "Save post"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* eslint-enable @typescript-eslint/no-explicit-any */
