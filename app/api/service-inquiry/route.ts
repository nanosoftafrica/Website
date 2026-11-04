import { NextResponse } from "next/server";
import { Contact, Company, Deal, Activity } from "@/lib/serverModels";
import { dispatchServiceInquiryNotifications } from "@/lib/integrationsService";
import { waNumber } from "@/lib/whatsapp";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      name,
      phone,
      email,
      company: companyName,
      productName,
      productSlug,
      requirements,
    } = body;

    if (!name || !String(name).trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!phone && !email) {
      return NextResponse.json({ error: "Either a phone/WhatsApp number or email is required" }, { status: 400 });
    }
    if (!productName) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }

    const trimmedName = String(name).trim();
    const nameParts = trimmedName.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || "";
    const cleanPhone = phone ? waNumber(String(phone), "") : "";

    // 1. Find or create Company if supplied
    let company: any = null;
    if (companyName && String(companyName).trim()) {
      const cName = String(companyName).trim();
      company = await Company.findOne({ where: { name: cName } });
      if (!company) {
        company = await Company.create({ name: cName, notes: "Created via product inquiry" });
      }
    }

    // 2. Find or create Contact
    let contact: any = null;
    if (cleanPhone) {
      contact = await Contact.findOne({ where: { phone: cleanPhone } });
    }
    if (!contact && email) {
      contact = await Contact.findOne({ where: { email: String(email).trim().toLowerCase() } });
    }

    if (!contact) {
      contact = await Contact.create({
        firstName,
        lastName,
        email: email ? String(email).trim().toLowerCase() : "",
        phone: cleanPhone,
        companyId: company ? company.id : null,
        source: "website_inquiry",
        notes: `Inquired on website for ${productName}`,
      });
    } else if (company && !contact.companyId) {
      await contact.update({ companyId: company.id });
    }

    // 3. Create Sales Deal in stage 'new'
    const dealTitle = `Inquiry: ${productName} — ${company?.name || trimmedName}`;
    const deal = await Deal.create({
      title: dealTitle,
      stage: "new",
      contactId: contact.id,
      companyId: company ? company.id : null,
      notes: `Requirements: ${requirements || "General inquiry"}\nProduct: ${productName} (${productSlug || ""})`,
    });

    // 4. Record Activity Task
    await Activity.create({
      type: "task",
      subject: `Follow up with ${trimmedName} (${productName})`,
      body: `Client requested service inquiry for ${productName}.\nPhone: ${cleanPhone}\nEmail: ${email || "N/A"}\nRequirements: ${requirements || "None"}`,
      contactId: contact.id,
      companyId: company ? company.id : null,
      dealId: deal.id,
      completed: false,
      createdBy: "website_automation",
    });

    // 5. Dispatch automated notifications across WhatsApp & Email
    await dispatchServiceInquiryNotifications({
      clientName: trimmedName,
      clientPhone: cleanPhone,
      clientEmail: email ? String(email).trim() : undefined,
      companyName: company?.name,
      productName,
      requirements,
      dealId: deal.id,
    });

    return NextResponse.json({
      ok: true,
      dealId: deal.id,
      message: "Thank you! Your inquiry has been received and our team will follow up shortly.",
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
