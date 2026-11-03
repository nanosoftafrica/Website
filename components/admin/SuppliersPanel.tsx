"use client";

import CrudPanel, { type CrudColumn, type CrudField } from "./CrudPanel";

const columns: CrudColumn[] = [
  { key: "name", label: "Name" },
  { key: "specialty", label: "Specialty" },
  { key: "phone", label: "Phone" },
  {
    key: "active",
    label: "Status",
    render: (s) => (
      <span className={`adm-badge ${s.active ? "adm-badge-active" : "adm-badge-inactive"}`}>
        {s.active ? "Active" : "Inactive"}
      </span>
    ),
  },
];

const fields: CrudField[] = [
  { key: "name", label: "Supplier name", type: "text", required: true },
  { key: "contactName", label: "Contact name", type: "text" },
  { key: "email", label: "Email", type: "email" },
  { key: "phone", label: "Phone", type: "text" },
  { key: "specialty", label: "Specialty", type: "text" },
  { key: "address", label: "Address", type: "text" },
  { key: "notes", label: "Notes", type: "textarea" },
  { key: "active", label: "Active", type: "checkbox" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SuppliersPanel({ initialItems }: { initialItems: any[] }) {
  return (
    <CrudPanel
      title="Suppliers"
      apiBase="/api/admin/suppliers"
      initialItems={initialItems}
      columns={columns}
      fields={fields}
      entityLabel="supplier"
      emptyLabel="No suppliers yet — add one to get started."
      deleteConfirm={(s) => `Delete supplier "${s.name}"? This cannot be undone.`}
      defaultValues={{ active: true }}
    />
  );
}
