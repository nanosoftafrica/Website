import { listAllPages } from "@/lib/adminDb";
import PagesListPanel from "@/components/admin/PagesListPanel";

export const dynamic = "force-dynamic";

export default async function PagesPage() {
  const pages = await listAllPages();
  return <PagesListPanel initialItems={pages} />;
}
