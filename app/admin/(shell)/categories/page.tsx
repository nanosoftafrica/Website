import { listAllCategories } from "@/lib/adminDb";
import CategoriesPanel from "@/components/admin/CategoriesPanel";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await listAllCategories();
  return <CategoriesPanel initialItems={categories} />;
}
