import { listMessages } from "@/lib/adminDb";
import MessagesPanel from "@/components/admin/MessagesPanel";
import ScreenHelp from "@/components/admin/ScreenHelp";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const messages = await listMessages();
  return (
    <>
      <ScreenHelp>{"Demo requests and messages that people send from the website forms."}</ScreenHelp>
      <MessagesPanel initialItems={messages} />
    </>
  );
}
