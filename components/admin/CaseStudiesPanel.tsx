"use client";

import CrudPanel, { type CrudColumn, type CrudField } from "./CrudPanel";

const columns: CrudColumn[] = [
  { key: "title", label: "Title" },
  { key: "client", label: "Client" },
  { key: "industry", label: "Industry" },
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
  { key: "title", label: "Title", type: "text", required: true, placeholder: "e.g. Campus-Wide Smart Infrastructure" },
  { key: "slug", label: "Slug", type: "text", required: true, placeholder: "e.g. nairobi-international-school" },
  { key: "client", label: "Client", type: "text", required: true, placeholder: "e.g. Nairobi International School" },
  { key: "industry", label: "Industry", type: "text", placeholder: "e.g. Education" },
  { key: "location", label: "Location", type: "text", placeholder: "e.g. Nairobi, Kenya" },
  { key: "summary", label: "Summary (shown on the list card)", type: "textarea" },
  { key: "challenge", label: "Challenge", type: "textarea" },
  { key: "solution", label: "Solution", type: "textarea" },
  { key: "outcome", label: "Outcome", type: "textarea" },
  { key: "servicesUsed", label: "Services used (one per line)", type: "list" },
  { key: "heroImage", label: "Hero image", type: "image" },
  { key: "active", label: "Active", type: "checkbox" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function CaseStudiesPanel({ initialItems }: { initialItems: any[] }) {
  return (
    <CrudPanel
      title="Case Studies"
      apiBase="/api/admin/case-studies"
      reorderUrl="/api/admin/case-studies/reorder"
      viewOnSite={(c) => ({
        label: `"${c.title}" is saved.`,
        href: c.active && c.slug ? `/case-studies/${encodeURIComponent(c.slug)}` : null,
        hiddenReason: "It is not Active, so it is hidden on the site. Tick Active to show this case study.",
      })}
      initialItems={initialItems}
      columns={columns}
      fields={fields}
      entityLabel="case study"
      emptyLabel="No case studies yet — add one to get started."
      deleteConfirm={(c) => `Delete case study "${c.title}"? This cannot be undone.`}
      defaultValues={{ active: true, color: "#0096D6", bgColor: "rgba(0,150,214,0.08)" }}
    />
  );
}
