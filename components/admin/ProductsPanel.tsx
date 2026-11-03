"use client";

import CrudPanel, { type CrudColumn, type CrudField } from "./CrudPanel";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ProductsPanel({ initialItems, categories }: { initialItems: any[]; categories: any[] }) {
  const columns: CrudColumn[] = [
    { key: "name", label: "Name" },
    { key: "category", label: "Category" },
    { key: "lifecycleStatus", label: "Lifecycle" },
    {
      key: "active",
      label: "Status",
      render: (p) => (
        <span className={`adm-badge ${p.active ? "adm-badge-active" : "adm-badge-inactive"}`}>
          {p.active ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  const fields: CrudField[] = [
    { key: "name", label: "Name", type: "text", required: true },
    { key: "slug", label: "Slug", type: "text", required: true },
    { key: "subtitle", label: "Subtitle", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
    {
      key: "categoryId",
      label: "Category",
      type: "select",
      options: categories.map((c) => ({ value: String(c.id), label: c.name })),
    },
    {
      key: "lifecycleStatus",
      label: "Lifecycle status",
      type: "select",
      options: [
        { value: "pipeline", label: "Pipeline" },
        { value: "active", label: "Active" },
        { value: "retiring", label: "Retiring" },
        { value: "retired", label: "Retired" },
      ],
    },
    {
      key: "slaLevel",
      label: "SLA level",
      type: "select",
      options: [
        { value: "basic", label: "Basic" },
        { value: "standard", label: "Standard" },
        { value: "enterprise", label: "Enterprise" },
      ],
    },
    { key: "targetAudience", label: "Target audience", type: "text" },
    { key: "features", label: "Features", type: "list", placeholder: "One feature per line" },
    { key: "benefits", label: "Benefits strip", type: "kvlist", placeholder: "icon | title | description (one per line)" },
    { key: "image", label: "Image", type: "image" },
    { key: "brochureUrl", label: "Brochure", type: "image" },
    { key: "color", label: "Accent color", type: "text", placeholder: "#0096D6" },
    { key: "active", label: "Active", type: "checkbox" },
  ];

  return (
    <CrudPanel
      title="Products"
      apiBase="/api/admin/products"
      reorderUrl="/api/admin/products/reorder"
      initialItems={initialItems}
      columns={columns}
      fields={fields}
      entityLabel="product"
      emptyLabel="No products yet — add one to get started."
      deleteConfirm={(p) => `Delete product "${p.name}"? This cannot be undone.`}
      defaultValues={{ active: true, lifecycleStatus: "active", slaLevel: "standard", color: "#0096D6" }}
    />
  );
}
