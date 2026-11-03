"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";

interface MediaItem {
  filename: string;
  url: string;
  size: number;
  created: string;
}

export default function MediaLibraryPanel() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/media");
    setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed");
        return;
      }
      await load();
    } catch {
      setError("Network error — please try again");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleDelete(item: MediaItem) {
    if (!confirm(`Delete "${item.filename}"? This removes the file — anything still referencing it will show a broken image.`)) return;
    const res = await fetch(`/api/admin/media/${item.filename}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((it) => it.filename !== item.filename));
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h1 className="adm-h1" style={{ marginBottom: 0 }}>
          Images
        </h1>
        <label className="adm-btn adm-btn-primary" style={{ cursor: "pointer" }}>
          {uploading ? "Uploading…" : "+ Upload"}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} disabled={uploading} style={{ display: "none" }} />
        </label>
      </div>
      {error && <p className="adm-error">{error}</p>}
      <div className="adm-panel" style={{ padding: 20 }}>
        {loading ? (
          <p style={{ color: "var(--adm-muted)" }}>Loading…</p>
        ) : items.length === 0 ? (
          <p style={{ color: "var(--adm-muted)", fontSize: 13 }}>No uploads yet.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 14 }}>
            {items.map((it) => (
              <div key={it.filename} style={{ border: "1px solid var(--adm-border)", borderRadius: 8, overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.url} alt="" style={{ width: "100%", height: 110, objectFit: "cover", display: "block" }} />
                <div style={{ padding: 8, fontSize: 11 }}>
                  <div style={{ color: "var(--adm-muted)", marginBottom: 6, wordBreak: "break-all" }}>
                    {(it.size / 1024).toFixed(0)} KB
                  </div>
                  <button className="adm-btn adm-btn-sm adm-btn-danger" style={{ width: "100%" }} onClick={() => handleDelete(it)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
