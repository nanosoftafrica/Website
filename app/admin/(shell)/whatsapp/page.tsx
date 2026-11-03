import { getWahaStatus, listWhatsAppMessages } from "@/lib/wahaService";
import { listContactsLite } from "@/lib/adminDb";
import WhatsAppHub from "@/components/admin/WhatsAppHub";

export const dynamic = "force-dynamic";

export default async function WhatsAppAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string; contactId?: string }>;
}) {
  const { phone, contactId } = await searchParams;

  const [wahaStatus, messages, contacts] = await Promise.all([
    getWahaStatus(),
    listWhatsAppMessages(60),
    listContactsLite(),
  ]);

  return (
    <WhatsAppHub
      initialStatus={wahaStatus}
      initialMessages={messages}
      contacts={contacts}
      prefilledPhone={phone || ""}
      prefilledContactId={contactId ? Number(contactId) : undefined}
    />
  );
}
