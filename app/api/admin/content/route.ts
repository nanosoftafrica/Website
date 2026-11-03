import { NextResponse } from "next/server";
import { Content } from "@/lib/serverModels";
import { requireSession, unauthorized } from "@/lib/adminApi";

const ALLOWED = ["hero", "company", "services", "clients", "processSteps", "seo", "sections"] as const;

export async function PUT(req: Request) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const body = await req.json().catch(() => ({}));
  try {
    const content = await Content.getSingleton();
    ALLOWED.forEach((key) => {
      if (body[key] !== undefined) content[key] = body[key];
    });
    // Sequelize needs an explicit nudge to detect in-place JSONB mutations.
    ALLOWED.forEach((key) => content.changed(key, true));
    await content.save();
    return NextResponse.json({ ok: true, content });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
