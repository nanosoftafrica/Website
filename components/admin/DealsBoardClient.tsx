"use client";

import { useState, type FormEvent } from "react";
import CrmListView, { type CrmColumn } from "./CrmListView";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface ContactLite {
  id: number;
  name: string;
  companyId: number | null;
}

interface CompanyLite {
  id: number;
  name: string;
}

const DEAL_COLUMNS: CrmColumn[] = [
  { key: "title", label: "Opportunity", type: "text", sortable: true, width: "200px" },
  { key: "stage", label: "Stage", type: "status", sortable: true, width: "120px" },
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
  { key: "expectedCloseDate", label: "Close Date", type: "date", sortable: true, width: "120px" },
  { key: "ownerUsername", label: "Owner", type: "text", sortable: true, width: "120px" },
];

export default function DealsBoardClient({
  initialBoard,
  contacts,
  companies,
}: {
  initialBoard: Record<string, any[]>;
  contacts: ContactLite[];
  companies: CompanyLite[];
}) {
  const allDeals = Object.values(initialBoard).flat();

  const [deals, setDeals] = useState<any[]>(allDeals);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function blank(): Record<string, any> {
    return {
      title: "",
      value: 0,
      currency: "KES",
      stage: "new",
      contactId: "",
      companyId: "",
      expectedCloseDate: "",
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
      value: item.value,
      currency: item.currency,
      stage: item.stage,
      contactId: item.contactId,
      companyId: item.companyId || "",
      expectedCloseDate: item.expectedCloseDate || "",
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
      expectedCloseDate: form.expectedCloseDate || null,
    };
    const url = editing ? `/api/admin/deals/${editing.id}` : "/api/admin/deals";
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

      setDeals((prev) =>
        editing
          ? prev.map((d) => (d.id === enriched.id ? enriched : d))
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
      const res = await fetch(`/api/admin/deals/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setDeals((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }

  // Enrich deals with contact/company names
  const enrichedDeals = deals.map((d) => ({
    ...d,
    contactName: contacts.find((c) => c.id === d.contactId)?.name || "",
    companyName: companies.find((c) => c.id === d.companyId)?.name || null,
  }));

  return (
    <>
      <CrmListView
        title="Opportunities"
        subtitle="Sales pipeline and deal management"
        columns={DEAL_COLUMNS}
        items={enrichedDeals}
        onEdit={openEdit}
        onDelete={handleDelete}
        onAdd={openAdd}
        primaryAction="New Opportunity"
      />

      {modalOpen && (
        <div className="adm-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3>{editing ? "Edit opportunity" : "Add opportunity"}</h3>
              <button type="button" className="adm-btn adm-btn-sm" onClick={() => setModalOpen(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="adm-modal-body">
                {error && <p className="adm-error">{error}</p>}
                <div className="adm-field">
                  <label>Title *</label>
                  <input value={form.title} required onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., ABC Corp Implementation" />
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
                <div style={{ display: "flex", gap: 10 }}>
                  <div className="adm-field" style={{ flex: 1 }}>
                    <label>Value</label>
                    <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
                  </div>
                  <div className="adm-field" style={{ flex: 1 }}>
                    <label>Currency</label>
                    <input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
                  </div>
                </div>
                <div className="adm-field">
                  <label>Stage</label>
                  <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="won">Won</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
                <div className="adm-field">
                  <label>Expected close date</label>
                  <input
                    type="date"
                    value={form.expectedCloseDate || ""}
                    onChange={(e) => setForm({ ...form, expectedCloseDate: e.target.value })}
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
