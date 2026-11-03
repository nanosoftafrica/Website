import { listAllProducts, listAllCategories } from "@/lib/adminDb";
import ProductsPanel from "@/components/admin/ProductsPanel";
import ScreenHelp from "@/components/admin/ScreenHelp";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([listAllProducts(), listAllCategories()]);
  return (
    <>
      <ScreenHelp>{"Each product here appears on the Solutions page (/products) and gets its own page. Untick Active to hide a product from the site."}</ScreenHelp>
      <ProductsPanel initialItems={products} categories={categories} />
    </>
  );
}
