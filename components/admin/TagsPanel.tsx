"use client";

import CrudPanel, { type CrudColumn, type CrudField } from "./CrudPanel";

const columns: CrudColumn[] = [
  { key: "name", label: "Name" },
  { key: "slug", label: "Slug" },
];

const fields: CrudField[] = [{ key: "name", label: "Tag name", type: "text", required: true }];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function TagsPanel({ initialItems }: { initialItems: any[] }) {
  return (
    <CrudPanel
      title="Tags"
      apiBase="/api/admin/tags"
      initialItems={initialItems}
      columns={columns}
      fields={fields}
      entityLabel="tag"
      emptyLabel="No tags yet — add one to get started."
      deleteConfirm={(t) => `Delete tag "${t.name}"? It will be removed from any posts using it.`}
    />
  );
}
