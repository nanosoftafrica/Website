import { listAllEvents } from "@/lib/adminDb";
import EventsPanel from "@/components/admin/EventsPanel";
import ScreenHelp from "@/components/admin/ScreenHelp";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await listAllEvents();
  return (
    <>
      <ScreenHelp>{"Events appear on the timeline in the About section of the home page. Untick Active to hide one."}</ScreenHelp>
      <EventsPanel initialItems={events} />
    </>
  );
}
