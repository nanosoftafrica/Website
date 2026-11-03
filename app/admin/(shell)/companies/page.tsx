import { listCompanies } from "@/lib/adminDb";
import CompaniesPanel from "@/components/admin/CompaniesPanel";
import ScreenHelp from "@/components/admin/ScreenHelp";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const companies = await listCompanies();
  return (
    <>
      <ScreenHelp>{"Companies your contacts work for. Nothing here changes the website."}</ScreenHelp>
      <CompaniesPanel initialItems={companies} />
    </>
  );
}
