import { listContactsFull, listCompanies } from "@/lib/adminDb";
import ContactsPanel from "@/components/admin/ContactsPanel";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const [contacts, companies] = await Promise.all([listContactsFull(), listCompanies()]);
  return <ContactsPanel initialItems={contacts} companies={companies} />;
}
