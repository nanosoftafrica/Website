import { NextResponse } from "next/server";
import { Company } from "@/lib/serverModels";
import { requireSession, unauthorized, createCrudCreateHandler, type SimpleCrudConfig } from "@/lib/adminApi";

export const companyCrudConfig: SimpleCrudConfig = {
  entity: "company",
  label: "company",
  validate: (body) => (!body.name || !String(body.name).trim() ? "Company name is required" : null),
  displayName: (c) => c.name,
};

export async function GET() {
  const session = await requireSession();
  if (!session) return unauthorized();
  const companies = await Company.findAll({ order: [["name", "ASC"]] });
  return NextResponse.json(companies);
}

export const POST = createCrudCreateHandler(Company, companyCrudConfig);
