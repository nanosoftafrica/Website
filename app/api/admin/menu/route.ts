import { NextResponse } from "next/server";
import { MenuItem } from "@/lib/serverModels";
import { requireSession, unauthorized, audit } from "@/lib/adminApi";

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const body = await req.json().catch(() => ({}));
  if (!body.label || !String(body.label).trim() || !body.href || !String(body.href).trim()) {
    return NextResponse.json({ error: "Label and link are required" }, { status: 400 });
  }
  try {
    const item = await MenuItem.create(body);
    await audit(session, "create", "menu_item", item.id, "Created menu item: " + item.label);
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
