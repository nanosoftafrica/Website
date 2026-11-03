"use client";

import { useState } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function MessagesPanel({ initialItems }: { initialItems: any[] }) {
  const [items, setItems] = useState<any[]>(initialItems);

  async function markRead(m: any) {
    const res = await fetch(`/api/admin/messages/${m.id}/read`, { method: "PATCH" });
    if (res.ok) setItems((prev) => prev.map((it) => (it.id === m.id ? { ...it, read: true } : it)));
  }

  async function handleDelete(m: any) {
    if (!confirm(`Delete message from "${m.name}"?`)) return;
    const res = await fetch(`/api/admin/messages/${m.id}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((it) => it.id !== m.id));
  }

  return (
    <div>
      <h1 className="adm-h1">Demo requests and messages</h1>
      <p className="adm-sub">Sent from the forms on the website.</p>
      <div className="adm-panel">
        <table className="adm-table">
          <thead>
            <tr>
              <th>From</th>
              <th>Interest</th>
              <th>Message</th>
              <th>Requested</th>
              <th>Received</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="adm-table-empty">
                  No messages yet.
                </td>
              </tr>
            )}
            {items.map((m) => (
              <tr key={m.id} style={{ background: m.read ? "transparent" : "rgba(0,150,214,0.04)" }}>
                <td>
                  <div style={{ fontWeight: m.read ? 400 : 700 }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: "var(--adm-muted)" }}>{[m.email, m.phone].filter(Boolean).join(" / ")}</div>
                </td>
                <td>{m.interest}</td>
                <td style={{ maxWidth: 300 }}>{m.message}</td>
                <td style={{ whiteSpace: "nowrap", fontSize: 13 }}>
                  {m.preferredDate ? (
                    <>
                      {new Date(m.preferredDate + "T00:00:00").toLocaleDateString("en-KE", {
                        day: "2-digit",
                        month: "short",
                      })}
                      {m.preferredTime ? ` · ${m.preferredTime}` : ""}
                    </>
                  ) : (
                    <span style={{ color: "var(--adm-muted)" }}>—</span>
                  )}
                </td>
                <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                  {!m.read && (
                    <button className="adm-btn adm-btn-sm" onClick={() => markRead(m)}>
                      Mark read
                    </button>
                  )}{" "}
                  <button className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => handleDelete(m)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* eslint-enable @typescript-eslint/no-explicit-any */
