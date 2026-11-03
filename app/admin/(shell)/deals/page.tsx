import { getDealsBoard, listContactsLite, listCompanies } from "@/lib/adminDb";
import DealsBoardClient from "@/components/admin/DealsBoardClient";
import ScreenHelp from "@/components/admin/ScreenHelp";

export const dynamic = "force-dynamic";

export default async function DealsPage() {
  const [board, contacts, companies] = await Promise.all([getDealsBoard(), listContactsLite(), listCompanies()]);
  return (
    <>
      <ScreenHelp>{"Track sales deals stage by stage. Nothing here changes the website."}</ScreenHelp>
      <DealsBoardClient initialBoard={board} contacts={contacts} companies={companies} />
    </>
  );
}
