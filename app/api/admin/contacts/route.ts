import { NextResponse } from "next/server";
import { Contact } from "@/lib/serverModels";
import { requireSession, unauthorized, audit } from "@/lib/adminApi";

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const body = await req.json().catch(() => ({}));
  if (!body.firstName || !String(body.firstName).trim() || !body.email || !String(body.email).trim()) {
    return NextResponse.json({ error: "First name and email are required" }, { status: 400 });
  }
  try {
    const contact = await Contact.create(body);
    await audit(session, "create", "contact", contact.id, "Created contact: " + contact.firstName + " " + contact.lastName);
    return NextResponse.json(contact, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
