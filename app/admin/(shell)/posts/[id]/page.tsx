import { notFound } from "next/navigation";
import { getPostById } from "@/lib/adminDb";
import PostEditor from "@/components/admin/PostEditor";

export const dynamic = "force-dynamic";

export default async function PostEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id === "new") {
    return <PostEditor initialPost={null} />;
  }
  const post = await getPostById(id);
  if (!post) notFound();
  return <PostEditor initialPost={post} />;
}
