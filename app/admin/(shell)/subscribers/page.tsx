import { listSubscribers } from "@/lib/adminDb";
import SubscribersPanel from "@/components/admin/SubscribersPanel";
import ScreenHelp from "@/components/admin/ScreenHelp";

export const dynamic = "force-dynamic";

export default async function SubscribersPage() {
  const subscribers = await listSubscribers();
  return (
    <>
      <ScreenHelp>{"People who signed up for the newsletter on the website."}</ScreenHelp>
      <SubscribersPanel initialItems={subscribers} />
    </>
  );
}
