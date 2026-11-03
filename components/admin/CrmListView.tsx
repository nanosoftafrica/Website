"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface CrmColumn {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "status" | "email" | "phone";
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, item: any) => React.ReactNode;
  width?: string;
}

export interface CrmListProps {
  title: string;
  subtitle?: string;
  columns: CrmColumn[];
  items: any[];
  onEdit?: (item: any) => void;
  onDelete: (id: number) => Promise<void>;
  onAdd: () => void;
  statusOptions?: { value: string; label: string; color: string }[];
  primaryAction?: string;
  baseUrl?: string; // e.g., "/admin/companies" for detail page navigation
}

const statusColors: Record<string, string> = {
  new: "#3b82f6",
  contacted: "#8b5cf6",
  qualified: "#ec4899",
  won: "#10b981",
  lost: "#ef4444",
  open: "#3b82f6",
  in_progress: "#f59e0b",
  completed: "#10b981",
  closed: "#6b7280",
  // Incident statuses
  on_hold: "#a855f7",
  resolved: "#10b981",
  // Incident severities
  critical: "#dc2626",
  high: "#f97316",
  medium: "#f59e0b",
  low: "#3b82f6",
  // Service request stages
  sourcing: "#8b5cf6",
  supplier_ordered: "#f59e0b",
  delivered: "#0ea5e9",
  installation: "#f97316",
  done: "#10b981",
  cancelled: "#ef4444",
};

export default function CrmListView({
  title,
  subtitle,
  columns,
  items,
  onEdit,
  onDelete,
  onAdd,
  statusOptions,
  primaryAction = "Add",
  baseUrl,
}: CrmListProps) {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [filterStage, setFilterStage] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deleting, setDeleting] = useState<number | null>(null);

  // Sort items
  let sorted = [...items];
  if (sortBy) {
    sorted.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (aVal == null || bVal == null) return 0;
      const cmp = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }

  // Filter items
  let filtered = sorted;
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter((item) =>
      Object.values(item).some((v) => String(v).toLowerCase().includes(q))
    );
  }
  if (filterStage) {
    filtered = filtered.filter((item) => item.stage === filterStage);
  }

  // Toggle sort
  function handleHeaderClick(key: string) {
    if (sortBy === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortDir("asc");
    }
  }

  // Toggle select all
  function toggleSelectAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((item) => item.id)));
    }
  }

  // Toggle select item
  function toggleSelect(id: number) {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  }

  async function handleDelete(id: number) {
    if (confirm("Delete this item?")) {
      setDeleting(id);
      try {
        await onDelete(id);
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } catch (err) {
        alert("Delete failed: " + (err as Error).message);
      } finally {
        setDeleting(null);
      }
    }
  }

  // Get unique stages for filter
  const stages = [...new Set(items.map((i) => i.stage))].sort();

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 className="adm-h1">{title}</h1>
          {subtitle && <p className="adm-sub">{subtitle}</p>}
        </div>
        {baseUrl ? (
          <Link href={`${baseUrl}/new`} className="adm-btn adm-btn-primary" style={{ textDecoration: "none" }}>
            + {primaryAction}
          </Link>
        ) : (
          <button className="adm-btn adm-btn-primary" onClick={onAdd}>
            + {primaryAction}
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="crm-toolbar">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="crm-search"
        />
        {stages.length > 0 && (
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="crm-filter"
          >
            <option value="">All Stages</option>
            {stages.map((s) => (
              <option key={s} value={s}>
                {String(s).replace(/_/g, " ")}
              </option>
            ))}
          </select>
        )}
        {selectedIds.size > 0 && (
          <div className="crm-selection-info">
            {selectedIds.size} selected
          </div>
        )}
      </div>

      {/* Table */}
      <div className="adm-panel">
        <table className="adm-table crm-table">
          <thead>
            <tr>
              <th className="crm-col-check">
                <input
                  type="checkbox"
                  checked={selectedIds.size > 0 && selectedIds.size === filtered.length}
                  onChange={toggleSelectAll}
                />
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleHeaderClick(col.key)}
                  className={col.sortable ? "crm-col-sortable" : ""}
                  style={{ width: col.width }}
                >
                  {col.label}
                  {sortBy === col.key && <span className={`crm-sort-icon ${sortDir}`}>▼</span>}
                </th>
              ))}
              <th className="crm-col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="adm-table-empty">
                  No items found
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id}>
                  <td className="crm-col-check">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(item.id)}
                      onChange={() => toggleSelect(item.id)}
                    />
                  </td>
                  {columns.map((col) => (
                    <td key={col.key} style={{ width: col.width }}>
                      {col.render ? (
                        col.render(item[col.key], item)
                      ) : col.type === "status" ? (
                        <span
                          className="crm-badge"
                          style={{ backgroundColor: statusColors[item[col.key]] || "#9ca3af" }}
                        >
                          {String(item[col.key]).replace(/_/g, " ")}
                        </span>
                      ) : col.type === "number" ? (
                        Number(item[col.key]).toLocaleString()
                      ) : col.type === "date" ? (
                        item[col.key] ? new Date(item[col.key]).toLocaleDateString() : "—"
                      ) : (
                        item[col.key] || "—"
                      )}
                    </td>
                  ))}
                  <td className="crm-col-actions">
                    {baseUrl ? (
                      <Link
                        href={`${baseUrl}/${item.id}`}
                        className="crm-action-btn"
                        title="Edit"
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        ✎
                      </Link>
                    ) : (
                      <button
                        className="crm-action-btn"
                        onClick={() => onEdit?.(item)}
                        title="Edit"
                      >
                        ✎
                      </button>
                    )}
                    <button
                      className="crm-action-btn crm-action-delete"
                      onClick={() => handleDelete(item.id)}
                      disabled={deleting === item.id}
                      title="Delete"
                    >
                      {deleting === item.id ? "..." : "🗑"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .crm-toolbar {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
          align-items: center;
          flex-wrap: wrap;
        }

        .crm-search {
          flex: 1;
          min-width: 200px;
          border: 1px solid var(--adm-border);
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 13px;
          font-family: inherit;
        }

        .crm-search:focus {
          outline: none;
          border-color: var(--adm-primary);
          box-shadow: 0 0 0 3px rgba(0, 150, 214, 0.1);
        }

        .crm-filter {
          border: 1px solid var(--adm-border);
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 13px;
          font-family: inherit;
        }

        .crm-selection-info {
          font-size: 12px;
          font-weight: 600;
          color: var(--adm-muted);
        }

        .crm-table {
          width: 100%;
        }

        .crm-col-check {
          width: 40px;
          text-align: center;
        }

        .crm-col-check input {
          cursor: pointer;
          width: 16px;
          height: 16px;
        }

        .crm-col-sortable {
          cursor: pointer;
          user-select: none;
        }

        .crm-col-sortable:hover {
          background: #f8fafc;
        }

        .crm-sort-icon {
          font-size: 10px;
          margin-left: 4px;
          opacity: 0.6;
          transform: rotate(0deg);
          transition: transform 0.2s;
        }

        .crm-sort-icon.desc {
          transform: rotate(180deg);
        }

        .crm-col-actions {
          width: 80px;
          text-align: center;
        }

        .crm-action-btn {
          background: none;
          border: 1px solid var(--adm-border);
          border-radius: 6px;
          padding: 4px 8px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.15s ease;
          margin: 0 2px;
        }

        .crm-action-btn:hover {
          border-color: var(--adm-primary);
          background: #f8fbfd;
        }

        .crm-action-btn.crm-action-delete:hover {
          border-color: var(--adm-danger);
          background: rgba(217, 45, 32, 0.08);
        }

        .crm-action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .crm-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          color: #fff;
          text-transform: capitalize;
        }
      `}</style>
    </div>
  );
}
