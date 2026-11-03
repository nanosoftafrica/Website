"use client";

import CrudPanel, { type CrudColumn, type CrudField } from "./CrudPanel";

const columns: CrudColumn[] = [
  { key: "name", label: "Name" },
  { key: "industry", label: "Industry" },
  { key: "phone", label: "Phone" },
  { key: "website", label: "Website" },
];

const fields: CrudField[] = [
  { key: "name", label: "Company name", type: "text", required: true },
  { key: "domain", label: "Domain", type: "text" },
  { key: "industry", label: "Industry", type: "text" },
  { key: "size", label: "Size", type: "text" },
  { key: "phone", label: "Phone", type: "text" },
  { key: "address", label: "Address", type: "text" },
  { key: "website", label: "Website", type: "text" },
  { key: "notes", label: "Notes", type: "textarea" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function CompaniesPanel({ initialItems }: { initialItems: any[] }) {
  return (
    <CrudPanel
      title="Companies"
      apiBase="/api/admin/companies"
      initialItems={initialItems}
      columns={columns}
      fields={fields}
      entityLabel="company"
      emptyLabel="No companies yet — add one to get started."
      deleteConfirm={(c) => `Delete company "${c.name}"? This cannot be undone.`}
    />
  );
}
