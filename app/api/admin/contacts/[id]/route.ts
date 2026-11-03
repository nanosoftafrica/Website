import { NextResponse } from "next/server";
import { Contact } from "@/lib/serverModels";
import { requireSession, unauthorized, audit } from "@/lib/adminApi";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (!body.firstName || !String(body.firstName).trim() || !body.email || !String(body.email).trim()) {
    return NextResponse.json({ error: "First name and email are required" }, { status: 400 });
  }
  const contact = await Contact.findByPk(id);
  if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    await contact.update(body);
    await audit(session, "update", "contact", contact.id, "Updated contact: " + contact.firstName + " " + contact.lastName);
    return NextResponse.json(contact);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const contact = await Contact.findByPk(id);
  if (contact) {
    await audit(session, "delete", "contact", contact.id, "Deleted contact: " + contact.firstName + " " + contact.lastName);
    await contact.destroy();
  }
  return NextResponse.json({ ok: true });
}
