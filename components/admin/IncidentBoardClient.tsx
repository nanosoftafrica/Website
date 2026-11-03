"use client";

import { useState, type FormEvent } from "react";
import CrmListView, { type CrmColumn } from "./CrmListView";
import { INCIDENT_STATUSES, INCIDENT_SEVERITIES, INCIDENT_IMPACTS, INCIDENT_URGENCIES, derivePriority } from "@/lib/ticketStages";

/* eslint-disable @typescript-eslint/no-explicit-any */

function label(value: string) {
  return value
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

const INCIDENT_COLUMNS: CrmColumn[] = [
  { key: "title", label: "Incident", type: "text", sortable: true, width: "200px" },
  { key: "status", label: "Status", type: "status", sortable: true, width: "120px" },
  { key: "severity", label: "Severity", type: "status", sortable: true, width: "110px" },
  { key: "priority", label: "Priority", type: "text", sortable: true, width: "90px", render: (v) => String(v).toUpperCase() },
  { key: "contactName", label: "Contact", type: "text", sortable: true, width: "150px" },
  { key: "companyName", label: "Company", type: "text", sortable: true, width: "150px" },
  { key: "ownerUsername", label: "Owner", type: "text", sortable: true, width: "120px" },
];

interface ContactLite {
  id: number;
  name: string;
  companyId: number | null;
}
interface CompanyLite {
  id: number;
  name: string;
}

export default function IncidentBoardClient({
  initialBoard,
  contacts,
  companies,
}: {
  initialBoard: Record<string, any[]>;
  contacts: ContactLite[];
  companies: CompanyLite[];
}) {
  const allIncidents = Object.values(initialBoard).flat();
  const [incidents, setIncidents] = useState<any[]>(allIncidents);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function blank(): Record<string, any> {
    return {
      title: "",
      description: "",
      contactId: "",
      companyId: "",
      severity: "medium",
      impact: "medium",
      urgency: "medium",
      status: "new",
      ownerUsername: "",
      slaTargetAt: "",
      notes: "",
    };
  }

  function openAdd() {
    setForm(blank());
    setEditing(null);
    setError("");
    setModalOpen(true);
  }

  function openEdit(item: any) {
    setForm({
      title: item.title,
      description: item.description || "",
      contactId: item.contactId,
      companyId: item.companyId || "",
      severity: item.severity,
      impact: item.impact,
      urgency: item.urgency,
      status: item.status,
      ownerUsername: item.ownerUsername || "",
      slaTargetAt: item.slaTargetAt ? item.slaTargetAt.slice(0, 16) : "",
      notes: item.notes || "",
    });
    setEditing(item);
    setError("");
    setModalOpen(true);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      ...form,
      contactId: Number(form.contactId),
      companyId: form.companyId ? Number(form.companyId) : null,
      slaTargetAt: form.slaTargetAt || null,
    };
    const url = editing ? `/api/admin/incidents/${editing.id}` : "/api/admin/incidents";
    const method = editing ? "PUT" : "POST";
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Save failed");
        setSaving(false);
        return;
      }
      const contact = contacts.find((c) => c.id === data.contactId);
      const company = companies.find((c) => c.id === data.companyId);
      const enriched = { ...data, contactName: contact?.name || "", companyName: company?.name || null };

      setIncidents((prev) =>
        editing
          ? prev.map((i) => (i.id === enriched.id ? enriched : i))
          : [...prev, enriched]
      );
      setSaving(false);
      setModalOpen(false);
    } catch {
      setError("Network error — please try again");
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      const res = await fetch(`/api/admin/incidents/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setIncidents((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }

  const enrichedIncidents = incidents.map((i) => ({
    ...i,
    contactName: contacts.find((c) => c.id === i.contactId)?.name || "",
    companyName: companies.find((c) => c.id === i.companyId)?.name || null,
  }));

  const livePriority = derivePriority(form.impact || "medium", form.urgency || "medium");

  return (
    <>
      <CrmListView
        title="Incidents"
        subtitle="Unplanned service disruptions awaiting restoration"
        columns={INCIDENT_COLUMNS}
        items={enrichedIncidents}
        onEdit={openEdit}
        onDelete={handleDelete}
        onAdd={openAdd}
        primaryAction="New Incident"
      />

      {modalOpen && (
        <div className="adm-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3>{editing ? "Edit incident" : "Add incident"}</h3>
              <button type="button" className="adm-btn adm-btn-sm" onClick={() => setModalOpen(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="adm-modal-body">
                {error && <p className="adm-error">{error}</p>}
                <div className="adm-field">
                  <label>Title *</label>
                  <input value={form.title} required onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="adm-field">
                  <label>Contact *</label>
                  <select value={form.contactId} required onChange={(e) => setForm({ ...form, contactId: e.target.value })}>
                    <option value="">Select a contact…</option>
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="adm-field">
                  <label>Company</label>
                  <select value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })}>
                    <option value="">—</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="adm-field">
                  <label>Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <div className="adm-field" style={{ flex: 1 }}>
                    <label>Severity</label>
                    <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                      {INCIDENT_SEVERITIES.map((s) => (
                        <option key={s} value={s}>
                          {label(s)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="adm-field" style={{ flex: 1 }}>
                    <label>Impact</label>
                    <select value={form.impact} onChange={(e) => setForm({ ...form, impact: e.target.value })}>
                      {INCIDENT_IMPACTS.map((s) => (
                        <option key={s} value={s}>
                          {label(s)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="adm-field" style={{ flex: 1 }}>
                    <label>Urgency</label>
                    <select value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })}>
                      {INCIDENT_URGENCIES.map((s) => (
                        <option key={s} value={s}>
                          {label(s)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="adm-field">
                  <label>Priority (derived)</label>
                  <input value={livePriority.toUpperCase()} disabled readOnly />
                </div>
                <div className="adm-field">
                  <label>Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {INCIDENT_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {label(s)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="adm-field">
                  <label>SLA target</label>
                  <input
                    type="datetime-local"
                    value={form.slaTargetAt || ""}
                    onChange={(e) => setForm({ ...form, slaTargetAt: e.target.value })}
                  />
                </div>
                <div className="adm-field">
                  <label>Owner</label>
                  <input
                    value={form.ownerUsername}
                    onChange={(e) => setForm({ ...form, ownerUsername: e.target.value })}
                    placeholder="Username"
                  />
                </div>
                <div className="adm-field">
                  <label>Notes</label>
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
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
    </>
  );
}

/* eslint-enable @typescript-eslint/no-explicit-any */
