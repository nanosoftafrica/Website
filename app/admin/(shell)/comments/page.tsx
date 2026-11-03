import { listComments } from "@/lib/adminDb";
import CommentsPanel from "@/components/admin/CommentsPanel";

export const dynamic = "force-dynamic";

export default async function CommentsPage() {
  const comments = await listComments();
  return <CommentsPanel initialItems={comments} />;
}
