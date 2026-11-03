import { NextResponse } from "next/server";
import { requireSession, unauthorized, audit } from "@/lib/adminApi";
import { listIntegrations, updateIntegration } from "@/lib/integrationsService";

export async function GET() {
  const session = await requireSession();
  if (!session) return unauthorized();

  try {
    const integrations = await listIntegrations(true);
    return NextResponse.json(integrations);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await requireSession();
  if (!session) return unauthorized();

  const body = await req.json().catch(() => ({}));
  if (!body.key) {
    return NextResponse.json({ error: "Integration key is required" }, { status: 400 });
  }

  try {
    const updated = await updateIntegration(body.key, {
      isEnabled: body.isEnabled,
      config: body.config,
    });
    await audit(session, "update", "integration", body.key, `Updated integration '${body.key}' settings`);
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
