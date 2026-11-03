import { listCompanies } from "@/lib/adminDb";
import CompaniesPanel from "@/components/admin/CompaniesPanel";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const companies = await listCompanies();
  return <CompaniesPanel initialItems={companies} />;
}
