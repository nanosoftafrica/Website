import { getIncidentsBoard, listContactsLite, listCompanies } from "@/lib/adminDb";
import IncidentBoardClient from "@/components/admin/IncidentBoardClient";
import ScreenHelp from "@/components/admin/ScreenHelp";

export const dynamic = "force-dynamic";

export default async function IncidentsPage() {
  const [board, contacts, companies] = await Promise.all([getIncidentsBoard(), listContactsLite(), listCompanies()]);
  return (
    <>
      <ScreenHelp>{"Log and track support incidents. Nothing here changes the website."}</ScreenHelp>
      <IncidentBoardClient initialBoard={board} contacts={contacts} companies={companies} />
    </>
  );
}
