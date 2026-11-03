import { listAllProducts, listAllCategories } from "@/lib/adminDb";
import ProductsPanel from "@/components/admin/ProductsPanel";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([listAllProducts(), listAllCategories()]);
  return <ProductsPanel initialItems={products} categories={categories} />;
}
