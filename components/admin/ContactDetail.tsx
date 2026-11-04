"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { waNumber } from "@/lib/whatsapp";

/* eslint-disable @typescript-eslint/no-explicit-any */

const ACTIVITY_TYPES = ["note", "whatsapp", "call", "email", "meeting", "task"];

export default function ContactDetail({ contact }: { contact: any }) {
  const [activities, setActivities] = useState<any[]>(contact.activities || []);
  const [type, setType] = useState("note");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleLog(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, subject, body, contactId: contact.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to log activity");
        return;
      }
      setActivities((prev) => [data, ...prev]);
      setSubject("");
      setBody("");
    } catch {
      setError("Network error — please try again");
    } finally {
      setSaving(false);
    }
  }

  async function handleComplete(id: number) {
    const res = await fetch(`/api/admin/activities/${id}/complete`, { method: "PATCH" });
    if (res.ok) {
      setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, completed: true } : a)));
    }
  }

  return (
    <div>
      <h1 className="adm-h1" style={{ marginBottom: 4 }}>
        {contact.firstName} {contact.lastName}
      </h1>
      <p className="adm-sub">{contact.jobTitle || "Contact"}</p>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20, alignItems: "start" }}>
        <div className="adm-panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
            <div>
              <strong>Email:</strong> {contact.email}
            </div>
            {contact.phone && (
              <div>
                <strong>Phone:</strong> {contact.phone}
                <div style={{ marginTop: 6 }}>
                  <a
                    href={`https://wa.me/${waNumber(contact.phone)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="adm-btn adm-btn-sm"
                    style={{ borderColor: "#10b981", color: "#047857", fontWeight: 600, display: "inline-flex", gap: 6, alignItems: "center" }}
                  >
                    <span>💬</span> Message on WhatsApp
                  </a>
                </div>
              </div>
            )}
            {contact.company && (
              <div>
                <strong>Company:</strong> {contact.company.name}
                <div style={{ marginTop: 4 }}>
                  <Link
                    href={`/admin/devices`}
                    className="adm-btn adm-btn-sm"
                    style={{ fontSize: 11, padding: "2px 8px" }}
                  >
                    📟 View Installed Devices
                  </Link>
                </div>
              </div>
            )}
            <div>
              <strong>Source:</strong> {contact.source}
            </div>
            {contact.notes && (
              <div>
                <strong>Notes:</strong>
                <p style={{ margin: "4px 0 0", color: "var(--adm-muted)" }}>{contact.notes}</p>
              </div>
            )}
          </div>

          <h3 style={{ fontSize: 14, marginTop: 24, marginBottom: 10 }}>Deals ({contact.deals?.length || 0})</h3>
          {contact.deals?.length ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {contact.deals.map((d: any) => (
                <div key={d.id} style={{ fontSize: 13, border: "1px solid var(--adm-border)", borderRadius: 6, padding: 8 }}>
                  <div style={{ fontWeight: 600 }}>{d.title}</div>
                  <div style={{ color: "var(--adm-muted)" }}>
                    {d.currency} {Number(d.value).toLocaleString()} · {d.stage}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "var(--adm-muted)" }}>No deals yet.</p>
          )}
        </div>

        <div>
          <div className="adm-panel" style={{ padding: 20, marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, marginTop: 0, marginBottom: 12 }}>Log activity</h3>
            {error && <p className="adm-error">{error}</p>}
            <form onSubmit={handleLog} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 10 }}>
                <select value={type} onChange={(e) => setType(e.target.value)} style={{ flex: 1 }}>
                  {ACTIVITY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={{ flex: 2 }}
                />
              </div>
              <textarea placeholder="Notes" value={body} onChange={(e) => setBody(e.target.value)} />
              <button type="submit" className="adm-btn adm-btn-primary" disabled={saving} style={{ alignSelf: "flex-start" }}>
                {saving ? "Logging…" : "Log activity"}
              </button>
            </form>
          </div>

          <h3 style={{ fontSize: 14, marginBottom: 10 }}>Activity timeline</h3>
          {activities.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--adm-muted)" }}>No activity logged yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {activities.map((a) => (
                <div key={a.id} className="adm-panel" style={{ padding: 12, display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>
                      {a.type}
                      {a.subject ? `: ${a.subject}` : ""}
                    </div>
                    {a.body && <div style={{ fontSize: 13, color: "var(--adm-muted)", marginTop: 2 }}>{a.body}</div>}
                    <div style={{ fontSize: 11, color: "var(--adm-muted)", marginTop: 4 }}>
                      {new Date(a.createdAt).toLocaleString()}
                    </div>
                  </div>
                  {!a.completed && a.type === "task" && (
                    <button className="adm-btn adm-btn-sm" onClick={() => handleComplete(a.id)}>
                      Mark done
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* eslint-enable @typescript-eslint/no-explicit-any */
