import { getServiceRequestsBoard, listContactsLite, listCompanies } from "@/lib/adminDb";
import ServiceRequestBoardClient from "@/components/admin/ServiceRequestBoardClient";
import ScreenHelp from "@/components/admin/ScreenHelp";

export const dynamic = "force-dynamic";

export default async function ServiceRequestsPage() {
  const [board, contacts, companies] = await Promise.all([getServiceRequestsBoard(), listContactsLite(), listCompanies()]);
  return (
    <>
      <ScreenHelp>{"Support requests from clients. Nothing here changes the website."}</ScreenHelp>
      <ServiceRequestBoardClient initialBoard={board} contacts={contacts} companies={companies} />
    </>
  );
}
