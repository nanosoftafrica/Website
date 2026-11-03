import { notFound } from "next/navigation";
import { getContactDetail } from "@/lib/adminDb";
import ContactDetail from "@/components/admin/ContactDetail";

export const dynamic = "force-dynamic";

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contact = await getContactDetail(id);
  if (!contact) notFound();
  return <ContactDetail contact={contact} />;
}
