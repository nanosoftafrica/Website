"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import MediaPicker from "./MediaPicker";

/* eslint-disable @typescript-eslint/no-explicit-any -- form/table data is
   dynamically keyed per entity config, not a fixed shape */

export interface CrudField {
  key: string;
  label: string;
  type: "text" | "email" | "textarea" | "checkbox" | "select" | "number" | "image" | "list" | "kvlist";
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
}

export interface CrudColumn {
  key: string;
  label: string;
  render?: (item: any) => ReactNode;
}

interface CrudPanelProps {
  title: string;
  apiBase: string;
  initialItems: any[];
  columns: CrudColumn[];
  fields: CrudField[];
  entityLabel: string;
  emptyLabel: string;
  deleteConfirm: (item: any) => string;
  defaultValues?: Record<string, any>;
  reorderUrl?: string;
}

function SortableRow({
  id,
  children,
}: {
  id: number;
  children: (handleProps: { ref: (el: HTMLElement | null) => void; attributes: any; listeners: any }) => ReactNode;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <tr ref={setNodeRef} style={style}>
      {children({ ref: setActivatorNodeRef, attributes, listeners })}
    </tr>
  );
}

export default function CrudPanel({
  title,
  apiBase,
  initialItems,
  columns,
  fields,
  entityLabel,
  emptyLabel,
  deleteConfirm,
  defaultValues,
  reorderUrl,
}: CrudPanelProps) {
  const [items, setItems] = useState<any[]>(initialItems);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function blankForm(): Record<string, any> {
    const initial: Record<string, any> = { ...(defaultValues || {}) };
    fields.forEach((f) => {
      if (!(f.key in initial)) initial[f.key] = f.type === "checkbox" ? true : "";
    });
    return initial;
  }

  function openAdd() {
    setForm(blankForm());
    setEditing(null);
    setError("");
    setModalOpen(true);
  }

  function openEdit(item: any) {
    const initial: Record<string, any> = {};
    fields.forEach((f) => {
      const raw = item[f.key];
      if (f.type === "list") {
        initial[f.key] = Array.isArray(raw) ? raw.join("\n") : "";
      } else if (f.type === "kvlist") {
        initial[f.key] = Array.isArray(raw)
          ? raw.map((b: { icon?: string; title?: string; description?: string }) => `${b.icon || ""} | ${b.title || ""} | ${b.description || ""}`).join("\n")
          : "";
      } else {
        initial[f.key] = raw ?? (f.type === "checkbox" ? true : "");
      }
    });
    setForm(initial);
    setEditing(item);
    setError("");
    setModalOpen(true);
  }

  function setField(key: string, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const url = editing ? `${apiBase}/${editing.id}` : apiBase;
    const method = editing ? "PUT" : "POST";
    const payload: Record<string, any> = { ...form };
    fields.forEach((f) => {
      if (f.type === "list") {
        payload[f.key] = String(form[f.key] ?? "")
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
      } else if (f.type === "kvlist") {
        payload[f.key] = String(form[f.key] ?? "")
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean)
          .map((line) => {
            const [icon, title, ...rest] = line.split("|").map((s) => s.trim());
            return { icon: icon || "", title: title || "", description: rest.join("|").trim() };
          });
      }
    });
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
      setItems((prev) => (editing ? prev.map((it) => (it.id === editing.id ? data : it)) : [...prev, data]));
      setSaving(false);
      setModalOpen(false);
    } catch {
      setError("Network error — please try again");
      setSaving(false);
    }
  }

  async function handleDelete(item: any) {
    if (!confirm(deleteConfirm(item))) return;
    const res = await fetch(`${apiBase}/${item.id}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((it) => it.id !== item.id));
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((it) => it.id === active.id);
    const newIndex = items.findIndex((it) => it.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);
    if (reorderUrl) {
      fetch(reorderUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: reordered.map((it, i) => ({ id: it.id, order: i })) }),
      }).catch(() => {});
    }
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 className="adm-h1" style={{ marginBottom: 0 }}>
            {title}
          </h1>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={openAdd}>
          + Add {entityLabel}
        </button>
      </div>

      {(() => {
        const tableBody = (
          <table className="adm-table">
            <thead>
              <tr>
                {reorderUrl && <th style={{ width: 28 }}></th>}
                {columns.map((c) => (
                  <th key={c.key}>{c.label}</th>
                ))}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 1 + (reorderUrl ? 1 : 0)} className="adm-table-empty">
                    {emptyLabel}
                  </td>
                </tr>
              )}
              {reorderUrl ? (
                <SortableContext items={items.map((it) => it.id)} strategy={verticalListSortingStrategy}>
                  {items.map((item) => (
                    <SortableRow key={item.id} id={item.id}>
                      {({ ref, attributes, listeners }) => (
                        <>
                          <td ref={ref} {...attributes} {...listeners} style={{ cursor: "grab", color: "var(--adm-muted)" }}>
                            ⠿
                          </td>
                          {columns.map((c) => (
                            <td key={c.key}>{c.render ? c.render(item) : String(item[c.key] ?? "")}</td>
                          ))}
                          <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                            <button className="adm-btn adm-btn-sm" onClick={() => openEdit(item)}>
                              Edit
                            </button>{" "}
                            <button className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => handleDelete(item)}>
                              Delete
                            </button>
                          </td>
                        </>
                      )}
                    </SortableRow>
                  ))}
                </SortableContext>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    {columns.map((c) => (
                      <td key={c.key}>{c.render ? c.render(item) : String(item[c.key] ?? "")}</td>
                    ))}
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <button className="adm-btn adm-btn-sm" onClick={() => openEdit(item)}>
                        Edit
                      </button>{" "}
                      <button className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => handleDelete(item)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        );
        return (
          <div className="adm-panel">
            {reorderUrl ? (
              <DndContext id={apiBase} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                {tableBody}
              </DndContext>
            ) : (
              tableBody
            )}
          </div>
        );
      })()}

      {modalOpen && (
        <div className="adm-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3>{editing ? `Edit ${entityLabel}` : `Add ${entityLabel}`}</h3>
              <button className="adm-btn adm-btn-sm" onClick={() => setModalOpen(false)} type="button">
                ×
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="adm-modal-body">
                {error && <p className="adm-error">{error}</p>}
                {fields.map((f) => (
                  <div className="adm-field" key={f.key}>
                    {f.type === "checkbox" ? (
                      <div className="adm-field-check">
                        <input
                          type="checkbox"
                          id={f.key}
                          checked={!!form[f.key]}
                          onChange={(e) => setField(f.key, e.target.checked)}
                        />
                        <label htmlFor={f.key} style={{ marginBottom: 0 }}>
                          {f.label}
                        </label>
                      </div>
                    ) : f.type === "image" ? (
                      <MediaPicker label={f.label} value={form[f.key]} onChange={(url) => setField(f.key, url)} />
                    ) : (
                      <>
                        <label htmlFor={f.key}>
                          {f.label}
                          {f.required ? " *" : ""}
                        </label>
                        {f.type === "textarea" || f.type === "list" || f.type === "kvlist" ? (
                          <textarea
                            id={f.key}
                            value={form[f.key] ?? ""}
                            required={f.required}
                            placeholder={
                              f.type === "list"
                                ? f.placeholder || "One per line"
                                : f.type === "kvlist"
                                  ? f.placeholder || "icon | title | description (one per line)"
                                  : f.placeholder
                            }
                            onChange={(e) => setField(f.key, e.target.value)}
                          />
                        ) : f.type === "select" ? (
                          <select
                            id={f.key}
                            value={form[f.key] ?? ""}
                            required={f.required}
                            onChange={(e) => setField(f.key, e.target.value)}
                          >
                            <option value="">—</option>
                            {(f.options || []).map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            id={f.key}
                            type={f.type}
                            value={form[f.key] ?? ""}
                            required={f.required}
                            placeholder={f.placeholder}
                            onChange={(e) => setField(f.key, e.target.value)}
                          />
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
              <div className="adm-modal-footer">
                <button type="button" className="adm-btn" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="adm-btn adm-btn-primary" disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* eslint-enable @typescript-eslint/no-explicit-any */
