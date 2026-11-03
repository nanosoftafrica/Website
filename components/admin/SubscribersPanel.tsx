"use client";

import { useState } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function SubscribersPanel({ initialItems }: { initialItems: any[] }) {
  const [items, setItems] = useState<any[]>(initialItems);

  async function handleDelete(s: any) {
    if (!confirm(`Remove subscriber "${s.email}"?`)) return;
    const res = await fetch(`/api/admin/subscribers/${s.id}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((it) => it.id !== s.id));
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h1 className="adm-h1" style={{ marginBottom: 0 }}>
          Subscribers
        </h1>
        <a href="/api/admin/subscribers/export" className="adm-btn adm-btn-sm">
          Export CSV
        </a>
      </div>
      <div className="adm-panel">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Subscribed</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="adm-table-empty">
                  No subscribers yet.
                </td>
              </tr>
            )}
            {items.map((s) => (
              <tr key={s.id}>
                <td>{s.email}</td>
                <td>{s.name || "—"}</td>
                <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                <td style={{ textAlign: "right" }}>
                  <button className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => handleDelete(s)}>
                    Remove
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
