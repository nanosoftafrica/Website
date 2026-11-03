"use client";

import CrudPanel, { type CrudColumn, type CrudField } from "./CrudPanel";

const columns: CrudColumn[] = [
  { key: "name", label: "Name" },
  { key: "company", label: "Company" },
  { key: "rating", label: "Rating", render: (t) => "★".repeat(Number(t.rating) || 0) },
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
  { key: "company", label: "Company", type: "text" },
  { key: "quote", label: "Quote", type: "textarea", required: true },
  {
    key: "rating",
    label: "Rating",
    type: "select",
    options: [1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n} star${n === 1 ? "" : "s"}` })),
  },
  { key: "photo", label: "Photo", type: "image" },
  { key: "active", label: "Active", type: "checkbox" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function TestimonialsPanel({ initialItems }: { initialItems: any[] }) {
  return (
    <CrudPanel
      title="Testimonials"
      apiBase="/api/admin/testimonials"
      reorderUrl="/api/admin/testimonials/reorder"
      initialItems={initialItems}
      columns={columns}
      fields={fields}
      entityLabel="testimonial"
      emptyLabel="No testimonials yet — add one to get started."
      deleteConfirm={(t) => `Delete testimonial from "${t.name}"? This cannot be undone.`}
      defaultValues={{ active: true, rating: "5" }}
    />
  );
}
