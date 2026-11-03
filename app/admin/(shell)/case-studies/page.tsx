import { listAllCaseStudies } from "@/lib/adminDb";
import CaseStudiesPanel from "@/components/admin/CaseStudiesPanel";
import ScreenHelp from "@/components/admin/ScreenHelp";

export const dynamic = "force-dynamic";

export default async function CaseStudiesPage() {
  const caseStudies = await listAllCaseStudies();
  return (
    <>
      <ScreenHelp>{"Case studies appear on the Case Studies page (/case-studies), each with its own page. Untick Active to hide one."}</ScreenHelp>
      <CaseStudiesPanel initialItems={caseStudies} />
    </>
  );
}
