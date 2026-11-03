import { getAnalytics } from "@/lib/adminDb";
import InsightsPanel from "@/components/admin/InsightsPanel";
import ScreenHelp from "@/components/admin/ScreenHelp";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const analytics = await getAnalytics();
  return (
    <>
      <ScreenHelp>{"Website page views and totals for messages, subscribers and posts. Nothing here changes the website."}</ScreenHelp>
      <InsightsPanel analytics={analytics} />
    </>
  );
}
