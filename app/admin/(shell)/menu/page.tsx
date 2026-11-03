import { listAllMenu } from "@/lib/adminDb";
import MenuPanel from "@/components/admin/MenuPanel";
import ScreenHelp from "@/components/admin/ScreenHelp";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const menu = await listAllMenu();
  return (
    <>
      <ScreenHelp>{"These are the links in the top menu on every public page."}</ScreenHelp>
      <MenuPanel initialItems={menu} />
    </>
  );
}
