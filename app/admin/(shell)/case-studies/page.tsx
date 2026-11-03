import { listAllCaseStudies } from "@/lib/adminDb";
import CaseStudiesPanel from "@/components/admin/CaseStudiesPanel";

export const dynamic = "force-dynamic";

export default async function CaseStudiesPage() {
  const caseStudies = await listAllCaseStudies();
  return <CaseStudiesPanel initialItems={caseStudies} />;
}
