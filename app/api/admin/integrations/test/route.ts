import { NextResponse } from "next/server";
import { requireSession, unauthorized, audit } from "@/lib/adminApi";
import { testIntegration } from "@/lib/integrationsService";

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return unauthorized();

  const body = await req.json().catch(() => ({}));
  if (!body.key) {
    return NextResponse.json({ error: "Integration key is required" }, { status: 400 });
  }

  try {
    const result = await testIntegration(body.key, body.targetRecipient);
    await audit(
      session,
      "test",
      "integration",
      body.key,
      `Tested integration '${body.key}': ${result.success ? "Success" : "Failed"} - ${result.message}`
    );
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
