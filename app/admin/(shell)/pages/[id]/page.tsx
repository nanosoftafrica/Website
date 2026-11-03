import { notFound } from "next/navigation";
import { getPageById } from "@/lib/adminDb";
import PageEditor from "@/components/admin/PageEditor";

export const dynamic = "force-dynamic";

export default async function PageEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id === "new") {
    return <PageEditor initialPage={null} />;
  }
  const page = await getPageById(id);
  if (!page) notFound();
  return <PageEditor initialPage={page} />;
}
