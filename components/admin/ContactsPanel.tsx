"use client";

import Link from "next/link";
import CrudPanel, { type CrudColumn, type CrudField } from "./CrudPanel";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ContactsPanel({ initialItems, companies }: { initialItems: any[]; companies: any[] }) {
  const columns: CrudColumn[] = [
    {
      key: "name",
      label: "Name",
      render: (c) => (
        <Link href={`/admin/contacts/${c.id}`} style={{ color: "var(--adm-primary)", fontWeight: 600 }}>
          {c.firstName} {c.lastName}
        </Link>
      ),
    },
    { key: "email", label: "Email" },
    { key: "companyName", label: "Company" },
    { key: "source", label: "Source" },
  ];

  const fields: CrudField[] = [
    { key: "firstName", label: "First name", type: "text", required: true },
    { key: "lastName", label: "Last name", type: "text" },
    { key: "email", label: "Email", type: "email", required: true },
    { key: "phone", label: "Phone", type: "text" },
    { key: "jobTitle", label: "Job title", type: "text" },
    {
      key: "companyId",
      label: "Company",
      type: "select",
      options: companies.map((c) => ({ value: String(c.id), label: c.name })),
    },
    {
      key: "source",
      label: "Source",
      type: "select",
      options: [
        { value: "manual", label: "Manual" },
        { value: "website_form", label: "Website form" },
        { value: "referral", label: "Referral" },
        { value: "import", label: "Import" },
      ],
    },
    { key: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <CrudPanel
      title="Contacts"
      apiBase="/api/admin/contacts"
      initialItems={initialItems}
      columns={columns}
      fields={fields}
      entityLabel="contact"
      emptyLabel="No contacts yet — add one to get started."
      deleteConfirm={(c) => `Delete contact "${c.firstName} ${c.lastName}"? This cannot be undone.`}
      defaultValues={{ source: "manual" }}
    />
  );
}
