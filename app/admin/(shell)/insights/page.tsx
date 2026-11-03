import { getAnalytics } from "@/lib/adminDb";
import InsightsPanel from "@/components/admin/InsightsPanel";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const analytics = await getAnalytics();
  return <InsightsPanel analytics={analytics} />;
}
