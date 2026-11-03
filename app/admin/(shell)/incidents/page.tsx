import { getIncidentsBoard, listContactsLite, listCompanies } from "@/lib/adminDb";
import IncidentBoardClient from "@/components/admin/IncidentBoardClient";

export const dynamic = "force-dynamic";

export default async function IncidentsPage() {
  const [board, contacts, companies] = await Promise.all([getIncidentsBoard(), listContactsLite(), listCompanies()]);
  return <IncidentBoardClient initialBoard={board} contacts={contacts} companies={companies} />;
}
