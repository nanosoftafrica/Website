import { listAllPostsWithTags } from "@/lib/adminDb";
import PostsListPanel from "@/components/admin/PostsListPanel";
import ScreenHelp from "@/components/admin/ScreenHelp";

export const dynamic = "force-dynamic";

export default async function PostsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const posts = await listAllPostsWithTags();
  return (
    <>
      <ScreenHelp>{"Blog posts appear on the Blog page once their status is Published. Up to three published posts also show on the home page."}</ScreenHelp>
      <PostsListPanel initialItems={posts} savedId={saved} />
    </>
  );
}
