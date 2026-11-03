import { listAllPages } from "@/lib/adminDb";
import PagesListPanel from "@/components/admin/PagesListPanel";
import ScreenHelp from "@/components/admin/ScreenHelp";

export const dynamic = "force-dynamic";

export default async function PagesPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const pages = await listAllPages();
  return (
    <>
      <ScreenHelp>{"Published pages open at their own address, for example /about for a page whose slug is about. Draft pages stay hidden."}</ScreenHelp>
      <PagesListPanel initialItems={pages} savedId={saved} />
    </>
  );
}
