import { NextResponse } from "next/server";
import { WhatsAppMessage, Contact } from "@/lib/serverModels";

/**
 * Inbound webhook receiver for WAHA events (e.g. message received, session status changes)
 */
export async function POST(req: Request) {
  try {
    const payload = await req.json().catch(() => ({}));
    const event = payload.event; // e.g. "message"
    const data = payload.payload || payload;

    // Handle incoming messages
    if (event === "message" || data.from) {
      const from = String(data.from || "");
      const body = String(data.body || data.text || "");
      const cleanPhone = from.replace(/@c\.us$/, "").replace(/\D/g, "");

      if (cleanPhone && body) {
        // Try linking to existing contact with this phone
        const contact = await Contact.findOne({
          where: {
            phone: cleanPhone,
          },
        });

        await WhatsAppMessage.create({
          chatId: from,
          phone: cleanPhone,
          contactId: contact ? contact.id : null,
          direction: "inbound",
          body,
          status: "received",
          wahaMessageId: data.id || null,
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
