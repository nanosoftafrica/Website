import type { Metadata } from "next";
import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import ProductsListClient from "@/components/home/ProductsListClient";
import { listActiveCategoriesWithProducts, listActiveMenu, getSiteContent } from "@/lib/db";

export const metadata: Metadata = {
  title: "Products & Services — Nanosoft Technologies",
  description: "ERP, biometric, security and managed IT solutions for businesses across Africa.",
};

// Product data is admin-editable (CMS) — without this, Next.js prerenders
// this page once at build time and admin-panel edits wouldn't show until
// the next rebuild. Same freshness the old client-fetched page always had.
export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [categories, menu, content] = await Promise.all([
    listActiveCategoriesWithProducts(),
    listActiveMenu(),
    getSiteContent(),
  ]);
  const allProducts = categories.flatMap((c) => c.products);

  return (
    <>
      <Nav menu={menu} phone={content.company.phone} products={allProducts} categories={categories} logo={content.company.logo} />
      <main className="pl-main">
        <div className="pl-header">
          <div className="bl-tag">Products &amp; Services</div>
          <h1 className="bl-h1">What we offer</h1>
          <p className="bl-sub">ERP, biometric, security and managed IT solutions built for how African businesses work.</p>
        </div>

        {/* Cards open a quick-view modal instead of navigating to a separate
            page — see ProductsListClient. */}
        <ProductsListClient categories={categories} />
      </main>
      <Footer company={content.company} allProducts={allProducts} section={content.sections.footer} />
    </>
  );
}
