import { listContactsFull, listCompanies } from "@/lib/adminDb";
import ContactsPanel from "@/components/admin/ContactsPanel";
import ScreenHelp from "@/components/admin/ScreenHelp";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const [contacts, companies] = await Promise.all([listContactsFull(), listCompanies()]);
  return (
    <>
      <ScreenHelp>{"Your contact list. People who send the website demo form with an email address are added here automatically."}</ScreenHelp>
      <ContactsPanel initialItems={contacts} companies={companies} />
    </>
  );
}
