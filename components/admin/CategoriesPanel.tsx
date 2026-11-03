"use client";

import CrudPanel, { type CrudColumn, type CrudField } from "./CrudPanel";

const columns: CrudColumn[] = [
  { key: "icon", label: "" },
  { key: "name", label: "Name" },
  { key: "serviceTypeLabel", label: "Service Type" },
  {
    key: "active",
    label: "Status",
    render: (c) => (
      <span className={`adm-badge ${c.active ? "adm-badge-active" : "adm-badge-inactive"}`}>
        {c.active ? "Active" : "Inactive"}
      </span>
    ),
  },
];

const fields: CrudField[] = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "slug", label: "Slug", type: "text", placeholder: "auto-generated if left blank" },
  { key: "description", label: "Description", type: "textarea" },
  { key: "icon", label: "Icon (emoji)", type: "text", placeholder: "📦" },
  {
    key: "serviceType",
    label: "ITIL service type",
    type: "select",
    options: [
      { value: "business", label: "Business Service" },
      { value: "technical", label: "Technical Service" },
      { value: "supporting", label: "Supporting Service" },
    ],
  },
  { key: "serviceTypeLabel", label: "Service type label", type: "text" },
  { key: "color", label: "Color", type: "text", placeholder: "#0096D6" },
  { key: "active", label: "Active", type: "checkbox" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function CategoriesPanel({ initialItems }: { initialItems: any[] }) {
  return (
    <CrudPanel
      title="Categories"
      apiBase="/api/admin/categories"
      reorderUrl="/api/admin/categories/reorder"
      initialItems={initialItems}
      columns={columns}
      fields={fields}
      entityLabel="category"
      emptyLabel="No categories yet — add one to get started."
      deleteConfirm={(c) => `Delete category "${c.name}"? This cannot be undone.`}
      defaultValues={{ active: true, serviceType: "business", color: "#0096D6" }}
    />
  );
}
