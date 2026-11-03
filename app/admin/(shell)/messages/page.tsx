import { listMessages } from "@/lib/adminDb";
import MessagesPanel from "@/components/admin/MessagesPanel";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const messages = await listMessages();
  return <MessagesPanel initialItems={messages} />;
}
