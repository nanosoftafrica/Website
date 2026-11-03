"use client";

import CrudPanel, { type CrudColumn, type CrudField } from "./CrudPanel";

const columns: CrudColumn[] = [
  { key: "name", label: "Name" },
  { key: "role", label: "Role" },
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
  { key: "name", label: "Name", type: "text", required: true },
  { key: "role", label: "Role", type: "text" },
  { key: "initials", label: "Initials (used when no photo)", type: "text", placeholder: "e.g. JD" },
  { key: "photo", label: "Photo", type: "image" },
  { key: "gradient", label: "Avatar gradient (CSS)", type: "text" },
  { key: "bio", label: "Bio", type: "textarea" },
  { key: "active", label: "Active", type: "checkbox" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function TeamPanel({ initialItems }: { initialItems: any[] }) {
  return (
    <CrudPanel
      title="Team"
      apiBase="/api/admin/team"
      reorderUrl="/api/admin/team/reorder"
      initialItems={initialItems}
      columns={columns}
      fields={fields}
      entityLabel="team member"
      emptyLabel="No team members yet — add one to get started."
      deleteConfirm={(t) => `Remove "${t.name}" from the team page? This cannot be undone.`}
      defaultValues={{ active: true, gradient: "linear-gradient(135deg,#10b981,#0ea5e9)" }}
    />
  );
}
