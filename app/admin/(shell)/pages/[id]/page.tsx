import { notFound } from "next/navigation";
import { getPageById } from "@/lib/adminDb";
import PageEditor from "@/components/admin/PageEditor";
import ScreenHelp from "@/components/admin/ScreenHelp";

export const dynamic = "force-dynamic";

export default async function PageEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id === "new") {
    return (
    <>
      <ScreenHelp>{"Published pages open at their own address, for example /about for a page whose slug is about. Draft pages stay hidden."}</ScreenHelp>
      <PageEditor initialPage={null} />
    </>
  );
  }
  const page = await getPageById(id);
  if (!page) notFound();
  return (
    <>
      <ScreenHelp>{"Published pages open at their own address, for example /about for a page whose slug is about. Draft pages stay hidden."}</ScreenHelp>
      <PageEditor initialPage={page} />
    </>
  );
}
