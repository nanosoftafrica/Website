import { listAllMenu } from "@/lib/adminDb";
import MenuPanel from "@/components/admin/MenuPanel";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const menu = await listAllMenu();
  return <MenuPanel initialItems={menu} />;
}
