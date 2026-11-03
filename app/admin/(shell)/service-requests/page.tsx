import { getServiceRequestsBoard, listContactsLite, listCompanies } from "@/lib/adminDb";
import ServiceRequestBoardClient from "@/components/admin/ServiceRequestBoardClient";

export const dynamic = "force-dynamic";

export default async function ServiceRequestsPage() {
  const [board, contacts, companies] = await Promise.all([getServiceRequestsBoard(), listContactsLite(), listCompanies()]);
  return <ServiceRequestBoardClient initialBoard={board} contacts={contacts} companies={companies} />;
}
