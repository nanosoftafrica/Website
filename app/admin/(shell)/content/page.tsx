import { getSiteContent } from "@/lib/db";
import SiteContentEditor from "@/components/admin/SiteContentEditor";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  const content = await getSiteContent();
  return <SiteContentEditor initialContent={content} />;
}
