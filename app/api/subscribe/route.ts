// Ports server/app.js's POST /api/subscribe (Newsletter Subscriber
// creation). Rate limiting is NOT ported — the original uses
// express-rate-limit; deferred here, see squishy-riding-sprout.md plan.

import { NextRequest, NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Subscriber = require("../../../server/models/cms/Subscriber");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, name } = body as Record<string, string>;
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const [sub, created] = await Subscriber.findOrCreate({
      where: { email: email.toLowerCase().trim() },
      defaults: { name: name || "", active: true },
    });
    if (!created && !sub.active) await sub.update({ active: true });

    return NextResponse.json({ ok: true, message: created ? "Subscribed!" : "Already subscribed." });
  } catch (err) {
    if ((err as { name?: string }).name === "SequelizeValidationError") {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }
    return NextResponse.json({ error: "Subscribe failed" }, { status: 500 });
  }
}
