import { listAllCategories } from "@/lib/adminDb";
import CategoriesPanel from "@/components/admin/CategoriesPanel";
import ScreenHelp from "@/components/admin/ScreenHelp";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await listAllCategories();
  return (
    <>
      <ScreenHelp>{"Categories group your products on the Solutions page."}</ScreenHelp>
      <CategoriesPanel initialItems={categories} />
    </>
  );
}
