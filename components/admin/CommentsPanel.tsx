"use client";

import { useState } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function CommentsPanel({ initialItems }: { initialItems: any[] }) {
  const [items, setItems] = useState<any[]>(initialItems);
  const [filter, setFilter] = useState<string>("all");

  async function approve(c: any) {
    const res = await fetch(`/api/admin/comments/${c.id}/approve`, { method: "PATCH" });
    if (res.ok) setItems((prev) => prev.map((it) => (it.id === c.id ? { ...it, status: "approved" } : it)));
  }
  async function markSpam(c: any) {
    const res = await fetch(`/api/admin/comments/${c.id}/spam`, { method: "PATCH" });
    if (res.ok) setItems((prev) => prev.map((it) => (it.id === c.id ? { ...it, status: "spam" } : it)));
  }
  async function handleDelete(c: any) {
    if (!confirm(`Delete comment by "${c.name}"?`)) return;
    const res = await fetch(`/api/admin/comments/${c.id}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((it) => it.id !== c.id));
  }

  const filtered = filter === "all" ? items : items.filter((c) => c.status === filter);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h1 className="adm-h1" style={{ marginBottom: 0 }}>
          Comments
        </h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="spam">Spam</option>
        </select>
      </div>
      <div className="adm-panel">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Author</th>
              <th>Comment</th>
              <th>Post</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="adm-table-empty">
                  No comments.
                </td>
              </tr>
            )}
            {filtered.map((c) => (
              <tr key={c.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: "var(--adm-muted)" }}>{c.email}</div>
                </td>
                <td style={{ maxWidth: 300 }}>{c.body}</td>
                <td>{c.post?.title || "—"}</td>
                <td>
                  <span
                    className={`adm-badge ${c.status === "approved" ? "adm-badge-active" : "adm-badge-inactive"}`}
                  >
                    {c.status}
                  </span>
                </td>
                <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                  {c.status !== "approved" && (
                    <button className="adm-btn adm-btn-sm" onClick={() => approve(c)}>
                      Approve
                    </button>
                  )}{" "}
                  {c.status !== "spam" && (
                    <button className="adm-btn adm-btn-sm" onClick={() => markSpam(c)}>
                      Spam
                    </button>
                  )}{" "}
                  <button className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => handleDelete(c)}>
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
