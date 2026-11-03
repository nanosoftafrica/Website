import { NextResponse } from "next/server";
import { Contact } from "@/lib/serverModels";
import { requireSession, unauthorized } from "@/lib/adminApi";

// Minimal id+name list for populating contact <select> pickers in the
// Deals/Work Orders modals — the full Contacts management screen is a
// later phase, this just unblocks those two forms' required contactId.
export async function GET() {
  const session = await requireSession();
  if (!session) return unauthorized();
  const contacts = await Contact.findAll({
    order: [["firstName", "ASC"]],
    attributes: ["id", "firstName", "lastName", "companyId"],
  });
  return NextResponse.json(
    contacts.map((c: { id: number; firstName: string; lastName: string; companyId: number | null }) => ({
      id: c.id,
      name: `${c.firstName} ${c.lastName}`.trim(),
      companyId: c.companyId,
    }))
  );
}
