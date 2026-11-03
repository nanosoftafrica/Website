"use client";

import CrudPanel, { type CrudColumn, type CrudField } from "./CrudPanel";

const columns: CrudColumn[] = [
  { key: "name", label: "Name" },
  { key: "specialty", label: "Specialty" },
  { key: "phone", label: "Phone" },
  {
    key: "active",
    label: "Status",
    render: (t) => (
      <span className={`adm-badge ${t.active ? "adm-badge-active" : "adm-badge-inactive"}`}>
        {t.active ? "Active" : "Inactive"}
      </span>
    ),
  },
];

const fields: CrudField[] = [
  { key: "name", label: "Technician name", type: "text", required: true },
  { key: "email", label: "Email", type: "email" },
  { key: "phone", label: "Phone", type: "text" },
  { key: "specialty", label: "Specialty", type: "text" },
  { key: "notes", label: "Notes", type: "textarea" },
  { key: "active", label: "Active", type: "checkbox" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function TechniciansPanel({ initialItems }: { initialItems: any[] }) {
  return (
    <CrudPanel
      title="Technicians"
      apiBase="/api/admin/technicians"
      initialItems={initialItems}
      columns={columns}
      fields={fields}
      entityLabel="technician"
      emptyLabel="No technicians yet — add one to get started."
      deleteConfirm={(t) => `Delete technician "${t.name}"? This cannot be undone.`}
      defaultValues={{ active: true }}
    />
  );
}
