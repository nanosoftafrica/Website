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

export default function PostEditor({ initialPost }: { initialPost: any | null }) {
  const router = useRouter();
  const isNew = !initialPost;
  const [title, setTitle] = useState(initialPost?.title || "");
  const [slug, setSlug] = useState(initialPost?.slug || "");
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || "");
  const [body, setBody] = useState(initialPost?.body || "");
  const [coverImage, setCoverImage] = useState<string | null>(initialPost?.coverImage || null);
  const [author, setAuthor] = useState(initialPost?.author || "Nanosoft Technology");
  const [tagNames, setTagNames] = useState((initialPost?.tags || []).map((t: any) => t.name).join(", "));
  const [status, setStatus] = useState(initialPost?.status || "draft");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleTitleChange(v: string) {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = { title, slug, excerpt, body, coverImage, author, tagNames, status };
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
      router.push("/admin/posts");
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
          <button type="submit" className="adm-btn adm-btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save post"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* eslint-enable @typescript-eslint/no-explicit-any */
