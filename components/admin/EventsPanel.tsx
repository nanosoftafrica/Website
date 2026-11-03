"use client";

import CrudPanel, { type CrudColumn, type CrudField } from "./CrudPanel";

const columns: CrudColumn[] = [
  { key: "title", label: "Title" },
  { key: "date", label: "Date" },
  { key: "type", label: "Type" },
  {
    key: "active",
    label: "Status",
    render: (e) => (
      <span className={`adm-badge ${e.active ? "adm-badge-active" : "adm-badge-inactive"}`}>
        {e.active ? "Active" : "Inactive"}
      </span>
    ),
  },
];

const fields: CrudField[] = [
  { key: "title", label: "Title", type: "text", required: true },
  { key: "subtitle", label: "Subtitle", type: "text" },
  { key: "date", label: "Date (display text)", type: "text", placeholder: "e.g. June 2025" },
  { key: "description", label: "Description", type: "textarea" },
  { key: "image", label: "Image", type: "image" },
  {
    key: "type",
    label: "Type",
    type: "select",
    options: [
      { value: "celebration", label: "Celebration" },
      { value: "milestone", label: "Milestone" },
      { value: "award", label: "Award" },
      { value: "anniversary", label: "Anniversary" },
    ],
  },
  { key: "active", label: "Active", type: "checkbox" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function EventsPanel({ initialItems }: { initialItems: any[] }) {
  return (
    <CrudPanel
      title="Events"
      apiBase="/api/admin/events"
      reorderUrl="/api/admin/events/reorder"
      viewOnSite={(e) => ({
        label: `"${e.title}" is saved.`,
        href: e.active ? "/#about" : null,
        hiddenReason: "It is not Active, so it is hidden on the site. Tick Active to show this event.",
      })}
      initialItems={initialItems}
      columns={columns}
      fields={fields}
      entityLabel="event"
      emptyLabel="No roadmap events yet — add one to get started."
      deleteConfirm={(e) => `Delete event "${e.title}"? This cannot be undone.`}
      defaultValues={{ active: true, type: "celebration" }}
    />
  );
}
