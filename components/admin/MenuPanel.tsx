"use client";

import CrudPanel, { type CrudColumn, type CrudField } from "./CrudPanel";

const columns: CrudColumn[] = [
  { key: "label", label: "Label" },
  { key: "href", label: "Link" },
  { key: "newTab", label: "New tab", render: (m) => (m.newTab ? "Yes" : "No") },
  {
    key: "active",
    label: "Status",
    render: (m) => (
      <span className={`adm-badge ${m.active ? "adm-badge-active" : "adm-badge-inactive"}`}>
        {m.active ? "Active" : "Inactive"}
      </span>
    ),
  },
];

const fields: CrudField[] = [
  { key: "label", label: "Label", type: "text", required: true },
  { key: "href", label: "Link (URL or #section)", type: "text", required: true },
  { key: "newTab", label: "Open in new tab", type: "checkbox" },
  { key: "active", label: "Active", type: "checkbox" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function MenuPanel({ initialItems }: { initialItems: any[] }) {
  return (
    <CrudPanel
      title="Top menu"
      apiBase="/api/admin/menu"
      viewOnSite={() => ({ label: "The menu is saved.", href: "/" })}
      reorderUrl="/api/admin/menu/reorder"
      initialItems={initialItems}
      columns={columns}
      fields={fields}
      entityLabel="menu item"
      emptyLabel="No menu items yet — add one to get started."
      deleteConfirm={(m) => `Delete menu item "${m.label}"? This cannot be undone.`}
      defaultValues={{ active: true, newTab: false }}
    />
  );
}
