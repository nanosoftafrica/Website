import { notFound } from "next/navigation";
import { getPostById } from "@/lib/adminDb";
import PostEditor from "@/components/admin/PostEditor";
import ScreenHelp from "@/components/admin/ScreenHelp";

export const dynamic = "force-dynamic";

export default async function PostEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id === "new") {
    return (
    <>
      <ScreenHelp>{"Set Status to Published to put this post on the Blog page. Draft posts stay hidden."}</ScreenHelp>
      <PostEditor initialPost={null} />
    </>
  );
  }
  const post = await getPostById(id);
  if (!post) notFound();
  return (
    <>
      <ScreenHelp>{"Set Status to Published to put this post on the Blog page. Draft posts stay hidden."}</ScreenHelp>
      <PostEditor initialPost={post} />
    </>
  );
}
