import { listAllPostsWithTags } from "@/lib/adminDb";
import PostsListPanel from "@/components/admin/PostsListPanel";

export const dynamic = "force-dynamic";

export default async function PostsPage() {
  const posts = await listAllPostsWithTags();
  return <PostsListPanel initialItems={posts} />;
}
