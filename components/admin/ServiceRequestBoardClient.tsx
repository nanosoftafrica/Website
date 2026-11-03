"use client";

import { useState, type FormEvent } from "react";
import CrmListView, { type CrmColumn } from "./CrmListView";
import { SERVICE_REQUEST_STAGES } from "@/lib/ticketStages";

/* eslint-disable @typescript-eslint/no-explicit-any */

function stageLabel(stage: string) {
  return stage
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

const SERVICE_REQUEST_COLUMNS: CrmColumn[] = [
  { key: "title", label: "Service Request", type: "text", sortable: true, width: "200px" },
  { key: "stage", label: "Stage", type: "status", sortable: true, width: "140px" },
  {
    key: "contactName",
    label: "Contact",
    type: "text",
    sortable: true,
    width: "150px",
  },
  {
    key: "companyName",
    label: "Company",
    type: "text",
    sortable: true,
    width: "150px",
  },
  {
    key: "value",
    label: "Value (KES)",
    type: "number",
    sortable: true,
    width: "120px",
    render: (val) => `${Number(val).toLocaleString()}`,
  },
  { key: "expectedDate", label: "Expected Date", type: "date", sortable: true, width: "120px" },
  { key: "description", label: "Description", type: "text", width: "200px" },
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

export default function ServiceRequestBoardClient({
  initialBoard,
  contacts,
  companies,
}: {
  initialBoard: Record<string, any[]>;
  contacts: ContactLite[];
  companies: CompanyLite[];
}) {
  const allRequests = Object.values(initialBoard).flat();
  const [requests, setRequests] = useState<any[]>(allRequests);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function blank(): Record<string, any> {
    return {
      title: "",
      description: "",
      value: 0,
      stage: "new",
      contactId: "",
      companyId: "",
      expectedDate: "",
      ownerUsername: "",
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
      value: item.value,
      stage: item.stage,
      contactId: item.contactId,
      companyId: item.companyId || "",
      expectedDate: item.expectedDate || "",
      ownerUsername: item.ownerUsername || "",
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
      value: Number(form.value) || 0,
      contactId: Number(form.contactId),
      companyId: form.companyId ? Number(form.companyId) : null,
      expectedDate: form.expectedDate || null,
    };
    const url = editing ? `/api/admin/service-requests/${editing.id}` : "/api/admin/service-requests";
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

      setRequests((prev) =>
        editing
          ? prev.map((r) => (r.id === enriched.id ? enriched : r))
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
      const res = await fetch(`/api/admin/service-requests/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }

  // Enrich requests with contact/company names
  const enrichedRequests = requests.map((r) => ({
    ...r,
    contactName: contacts.find((c) => c.id === r.contactId)?.name || "",
    companyName: companies.find((c) => c.id === r.companyId)?.name || null,
  }));

  return (
    <>
      <CrmListView
        title="Service Requests"
        subtitle="Standard, pre-approved requests and fulfillment execution"
        columns={SERVICE_REQUEST_COLUMNS}
        items={enrichedRequests}
        onEdit={openEdit}
        onDelete={handleDelete}
        onAdd={openAdd}
        primaryAction="New Service Request"
      />

      {modalOpen && (
        <div className="adm-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3>{editing ? "Edit service request" : "Add service request"}</h3>
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
                <div className="adm-field">
                  <label>Value (KES)</label>
                  <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
                </div>
                <div className="adm-field">
                  <label>Stage</label>
                  <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}>
                    {SERVICE_REQUEST_STAGES.map((s) => (
                      <option key={s} value={s}>
                        {stageLabel(s)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="adm-field">
                  <label>Expected date</label>
                  <input
                    type="date"
                    value={form.expectedDate || ""}
                    onChange={(e) => setForm({ ...form, expectedDate: e.target.value })}
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
