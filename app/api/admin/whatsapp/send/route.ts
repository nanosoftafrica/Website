import { NextResponse } from "next/server";
import { requireSession, unauthorized, audit } from "@/lib/adminApi";
import { sendWhatsAppMessage } from "@/lib/wahaService";

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return unauthorized();

  const body = await req.json().catch(() => ({}));
  const { phone, text, contactId } = body;

  if (!phone || !text) {
    return NextResponse.json(
      { error: "Recipient phone number and message text are required" },
      { status: 400 }
    );
  }

  try {
    const result = await sendWhatsAppMessage({
      phone,
      text,
      contactId: contactId ? Number(contactId) : null,
      adminUsername: session.username,
    });

    await audit(
      session,
      "send_whatsapp",
      "contact",
      contactId || phone,
      `Sent WhatsApp message to ${phone}: ${text.substring(0, 30)}...`
    );

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
