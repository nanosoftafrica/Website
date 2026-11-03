import { getDealsBoard, listContactsLite, listCompanies } from "@/lib/adminDb";
import DealsBoardClient from "@/components/admin/DealsBoardClient";

export const dynamic = "force-dynamic";

export default async function DealsPage() {
  const [board, contacts, companies] = await Promise.all([getDealsBoard(), listContactsLite(), listCompanies()]);
  return <DealsBoardClient initialBoard={board} contacts={contacts} companies={companies} />;
}
