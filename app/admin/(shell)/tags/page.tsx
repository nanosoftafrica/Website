import { listTags } from "@/lib/adminDb";
import TagsPanel from "@/components/admin/TagsPanel";
import ScreenHelp from "@/components/admin/ScreenHelp";

export const dynamic = "force-dynamic";

export default async function TagsPage() {
  const tags = await listTags();
  return (
    <>
      <ScreenHelp>{"Tags group blog posts. Visitors can filter the Blog page by tag."}</ScreenHelp>
      <TagsPanel initialItems={tags} />
    </>
  );
}
