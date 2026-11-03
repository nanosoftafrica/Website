import { getSiteContent } from "@/lib/db";
import SiteContentEditor from "@/components/admin/SiteContentEditor";
import ScreenHelp from "@/components/admin/ScreenHelp";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  const content = await getSiteContent();
  return (
    <>
      <ScreenHelp>{"This screen changes the home page: the headline, About text, client logos, footer, and your contact and social links. Press Save all when you are done."}</ScreenHelp>
      <SiteContentEditor initialContent={content} />
    </>
  );
}
