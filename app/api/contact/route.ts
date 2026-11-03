// Ports server/routes/contact.js's POST /api/contact — same models, same
// CRM auto-capture, same optional-SMTP notification.

import { NextRequest, NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Message = require("../../../server/models/crm/Message");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Contact = require("../../../server/models/crm/Contact");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Activity = require("../../../server/models/crm/Activity");

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { name, email, phone, company, interest, message, preferredDate, preferredTime } = body as Record<string, string>;

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  try {
    const msg = await Message.create({
      name,
      email,
      phone,
      company,
      interest,
      message,
      preferredDate: preferredDate || null,
      preferredTime: preferredTime || null,
    });

    // CRM auto-capture — best-effort only, never blocks the form submission.
    try {
      const parts = name.trim().split(/\s+/);
      const [contact] = await Contact.findOrCreate({
        where: { email: email.toLowerCase().trim() },
        defaults: {
          firstName: parts[0] || name,
          lastName: parts.slice(1).join(" "),
          phone: phone || "",
          jobTitle: "",
          source: "website_form",
        },
      });
      await Activity.create({
        type: "note",
        subject: "Website enquiry" + (interest ? ": " + interest : ""),
        body: message || "",
        contactId: contact.id,
        createdBy: "system",
      });
    } catch (crmErr) {
      console.warn("CRM auto-capture failed:", (crmErr as Error).message);
    }

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const slot = preferredDate ? `${preferredDate}${preferredTime ? ` at ${preferredTime}` : ""}` : "";
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const nodemailer = require("nodemailer");
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || "587"),
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });

        // Internal notification — always sent.
        await transporter.sendMail({
          from: `"Nanosoft Website" <${process.env.SMTP_USER}>`,
          to: process.env.NOTIFY_EMAIL || process.env.SMTP_USER,
          subject: `New enquiry from ${name}`,
          html: `<h2>New enquiry</h2>
            <p><b>Name:</b> ${name}</p>
            <p><b>Email:</b> ${email}</p>
            <p><b>Phone:</b> ${phone || "—"}</p>
            <p><b>Company:</b> ${company || "—"}</p>
            <p><b>Interest:</b> ${interest || "—"}</p>
            ${slot ? `<p><b>Requested slot:</b> ${slot}</p>` : ""}
            <p><b>Message:</b><br>${(message || "").replace(/\n/g, "<br>")}</p>`,
        });

        // Visitor confirmation — best-effort, never blocks or fails the request.
        await transporter.sendMail({
          from: `"Nanosoft Technologies" <${process.env.SMTP_USER}>`,
          to: email,
          subject: "We've received your request — Nanosoft Technologies",
          html: `<p>Hi ${name.split(" ")[0]},</p>
            <p>Thanks for reaching out to Nanosoft Technologies. We've received your request${
              slot ? ` for <b>${slot}</b>` : ""
            } and our team will get back to you within 1 business day.</p>
            <p>If anything's urgent, call us on ${process.env.NOTIFY_PHONE || "0734 818 350"}.</p>
            <p>— Nanosoft Technologies</p>`,
        });
      } catch (emailErr) {
        console.warn("Email notification failed:", (emailErr as Error).message);
      }
    }

    return NextResponse.json({ ok: true, id: msg.id }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
  }
}
