import { listTags } from "@/lib/adminDb";
import TagsPanel from "@/components/admin/TagsPanel";

export const dynamic = "force-dynamic";

export default async function TagsPage() {
  const tags = await listTags();
  return <TagsPanel initialItems={tags} />;
}
