import { listSubscribers } from "@/lib/adminDb";
import SubscribersPanel from "@/components/admin/SubscribersPanel";

export const dynamic = "force-dynamic";

export default async function SubscribersPage() {
  const subscribers = await listSubscribers();
  return <SubscribersPanel initialItems={subscribers} />;
}
