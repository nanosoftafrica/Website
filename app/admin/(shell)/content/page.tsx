import { getSiteContent } from "@/lib/db";
import { Content } from "@/lib/serverModels";
import SiteContentEditor from "@/components/admin/SiteContentEditor";
import ScreenHelp from "@/components/admin/ScreenHelp";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  const [content, doc] = await Promise.all([getSiteContent(), Content.getSingleton()]);
  return (
    <>
      <ScreenHelp>{"This screen changes the home page: the headline, About text, client logos, footer, and your contact and social links. Press Save all when you are done. Undo last save puts back the version from before your latest save."}</ScreenHelp>
      <SiteContentEditor initialContent={content} contentId={doc.id} />
    </>
  );
}
