import { listAllEvents } from "@/lib/adminDb";
import EventsPanel from "@/components/admin/EventsPanel";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await listAllEvents();
  return <EventsPanel initialItems={events} />;
}
