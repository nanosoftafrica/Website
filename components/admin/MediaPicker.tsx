"use client";

import { useRef, useState, type ChangeEvent } from "react";

interface MediaItem {
  filename: string;
  url: string;
  size: number;
  created: string;
}

export default function MediaPicker({
  value,
  onChange,
  label,
}: {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function loadMedia() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      const data = await res.json();
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  function openPicker() {
    setOpen(true);
    setError("");
    loadMedia();
  }

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
      onChange(data.url);
      setOpen(false);
    } catch {
      setError("Network error — please try again");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="adm-field">
      {label && <label>{label}</label>}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 6, border: "1px solid var(--adm-border)" }}
          />
        ) : (
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 6,
              border: "1px dashed var(--adm-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              color: "var(--adm-muted)",
            }}
          >
            None
          </div>
        )}
        <button type="button" className="adm-btn adm-btn-sm" onClick={openPicker}>
          Choose…
        </button>
        {value && (
          <button type="button" className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => onChange(null)}>
            Remove
          </button>
        )}
      </div>

      {open && (
        <div className="adm-modal-backdrop" onClick={() => setOpen(false)}>
          <div className="adm-modal" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3>Choose image</h3>
              <button type="button" className="adm-btn adm-btn-sm" onClick={() => setOpen(false)}>
                ×
              </button>
            </div>
            <div className="adm-modal-body">
              {error && <p className="adm-error">{error}</p>}
              <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
              {uploading && <p style={{ fontSize: 12, color: "var(--adm-muted)" }}>Uploading…</p>}
              {loading ? (
                <p>Loading…</p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: 8, marginTop: 12 }}>
                  {items.map((it) => (
                    <button
                      type="button"
                      key={it.filename}
                      onClick={() => {
                        onChange(it.url);
                        setOpen(false);
                      }}
                      style={{
                        border: "1px solid var(--adm-border)",
                        borderRadius: 6,
                        padding: 0,
                        overflow: "hidden",
                        cursor: "pointer",
                        background: "none",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={it.url} alt="" style={{ width: "100%", height: 80, objectFit: "cover", display: "block" }} />
                    </button>
                  ))}
                  {items.length === 0 && <p style={{ color: "var(--adm-muted)", fontSize: 13 }}>No uploads yet.</p>}
                </div>
              )}
            </div>
            <div className="adm-modal-footer">
              <button type="button" className="adm-btn" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
