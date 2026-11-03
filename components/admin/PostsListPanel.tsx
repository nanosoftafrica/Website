"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ViewOnSiteNotice, { type SavedNotice } from "./ViewOnSiteNotice";

/* eslint-disable @typescript-eslint/no-explicit-any */

function noticeFor(post: any | undefined): SavedNotice | null {
  if (!post) return null;
  const published = post.status === "published";
  return {
    label: `"${post.title}" is saved.`,
    href: published && post.slug ? `/blog/${encodeURIComponent(post.slug)}` : null,
    hiddenReason: "It is a draft, so it is hidden on the site. Set Status to Published to show it.",
  };
}

export default function PostsListPanel({ initialItems, savedId }: { initialItems: any[]; savedId?: string }) {
  const router = useRouter();
  const [items, setItems] = useState<any[]>(initialItems);
  const [notice, setNotice] = useState<SavedNotice | null>(() =>
    savedId ? noticeFor(initialItems.find((p) => String(p.id) === savedId)) : null
  );

  async function handleDelete(post: any) {
    if (!confirm(`Delete post "${post.title}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/posts/${post.id}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((p) => p.id !== post.id));
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h1 className="adm-h1" style={{ marginBottom: 0 }}>
          Blog
        </h1>
        <button className="adm-btn adm-btn-primary" onClick={() => router.push("/admin/posts/new")}>
          + New post
        </button>
      </div>
      <ViewOnSiteNotice
        notice={notice}
        onClose={() => {
          setNotice(null);
          router.replace("/admin/posts");
        }}
      />
      <div className="adm-panel">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Tags</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="adm-table-empty">
                  No posts yet — write one to get started.
                </td>
              </tr>
            )}
            {items.map((post) => (
              <tr key={post.id}>
                <td>
                  <Link href={`/admin/posts/${post.id}`} style={{ color: "var(--adm-primary)", fontWeight: 600 }}>
                    {post.title}
                  </Link>
                </td>
                <td>{post.author}</td>
                <td>{(post.tags || []).map((t: any) => t.name).join(", ")}</td>
                <td>
                  <span className={`adm-badge ${post.status === "published" ? "adm-badge-active" : "adm-badge-inactive"}`}>
                    {post.status}
                  </span>
                </td>
                <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                  <button className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => handleDelete(post)}>
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
