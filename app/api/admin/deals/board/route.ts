import { NextResponse } from "next/server";
import { Deal, Contact, Company } from "@/lib/serverModels";
import { requireSession, unauthorized } from "@/lib/adminApi";

const DEAL_STAGES = ["new", "contacted", "qualified", "won", "lost"];

interface DealRow {
  id: number;
  contactId: number | null;
  companyId: number | null;
  stage: string;
  toJSON: () => Record<string, unknown>;
}

export async function GET() {
  const session = await requireSession();
  if (!session) return unauthorized();

  const deals: DealRow[] = await Deal.findAll({ order: [["order", "ASC"]] });
  const contactIds = [...new Set(deals.map((d) => d.contactId).filter(Boolean))];
  const companyIds = [...new Set(deals.map((d) => d.companyId).filter(Boolean))];
  const [contacts, companies] = await Promise.all([
    Contact.findAll({ where: { id: contactIds } }),
    Company.findAll({ where: { id: companyIds } }),
  ]);
  const contactById = Object.fromEntries(
    contacts.map((c: { id: number; firstName: string; lastName: string }) => [c.id, `${c.firstName} ${c.lastName}`.trim()])
  );
  const companyById = Object.fromEntries(companies.map((c: { id: number; name: string }) => [c.id, c.name]));

  const enriched = deals.map((d) => ({
    ...d.toJSON(),
    stage: d.stage,
    contactName: contactById[d.contactId as number] || "",
    companyName: (d.companyId && companyById[d.companyId]) || null,
  }));

  const board: Record<string, unknown[]> = {};
  DEAL_STAGES.forEach((s) => {
    board[s] = enriched.filter((d) => d.stage === s);
  });
  return NextResponse.json(board);
}
