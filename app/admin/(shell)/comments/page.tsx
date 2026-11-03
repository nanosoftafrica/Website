import { listComments } from "@/lib/adminDb";
import CommentsPanel from "@/components/admin/CommentsPanel";
import ScreenHelp from "@/components/admin/ScreenHelp";

export const dynamic = "force-dynamic";

export default async function CommentsPage() {
  const comments = await listComments();
  return (
    <>
      <ScreenHelp>{"Review comments on blog posts here. Comments are not shown on the website at the moment."}</ScreenHelp>
      <CommentsPanel initialItems={comments} />
    </>
  );
}
