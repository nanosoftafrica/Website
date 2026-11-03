"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ViewOnSiteNotice, { type SavedNotice } from "./ViewOnSiteNotice";

/* eslint-disable @typescript-eslint/no-explicit-any */

function noticeFor(page: any | undefined): SavedNotice | null {
  if (!page) return null;
  const published = page.status === "published";
  return {
    label: `"${page.title}" is saved.`,
    href: published && page.slug ? `/${encodeURIComponent(page.slug)}` : null,
    hiddenReason: "It is a draft, so it is hidden on the site. Set Status to Published to show it.",
  };
}

export default function PagesListPanel({ initialItems, savedId }: { initialItems: any[]; savedId?: string }) {
  const router = useRouter();
  const [items, setItems] = useState<any[]>(initialItems);
  const [notice, setNotice] = useState<SavedNotice | null>(() =>
    savedId ? noticeFor(initialItems.find((p) => String(p.id) === savedId)) : null
  );

  async function handleDelete(page: any) {
    if (!confirm(`Delete page "${page.title}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/pages/${page.id}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((p) => p.id !== page.id));
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h1 className="adm-h1" style={{ marginBottom: 0 }}>
          Pages
        </h1>
        <button className="adm-btn adm-btn-primary" onClick={() => router.push("/admin/pages/new")}>
          + New page
        </button>
      </div>
      <ViewOnSiteNotice
        notice={notice}
        onClose={() => {
          setNotice(null);
          router.replace("/admin/pages");
        }}
      />
      <div className="adm-panel">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Slug</th>
              <th>Blocks</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="adm-table-empty">
                  No pages yet — create one to get started.
                </td>
              </tr>
            )}
            {items.map((page) => (
              <tr key={page.id}>
                <td>
                  <Link href={`/admin/pages/${page.id}`} style={{ color: "var(--adm-primary)", fontWeight: 600 }}>
                    {page.title}
                  </Link>
                </td>
                <td>/{page.slug}</td>
                <td>{(page.blocks || []).length}</td>
                <td>
                  <span className={`adm-badge ${page.status === "published" ? "adm-badge-active" : "adm-badge-inactive"}`}>
                    {page.status}
                  </span>
                </td>
                <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                  <button className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => handleDelete(page)}>
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
