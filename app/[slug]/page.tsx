import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import { listActiveCategoriesWithProducts, listActiveMenu, getSiteContent } from "@/lib/db";
import { getPublishedPageBySlug } from "@/lib/db";
import PageBlocks from "@/components/PageBlocks";

// Published pages from admin (Website > Extra pages) open at /their-address.
// Fixed routes like /products and /blog always win over this one.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublishedPageBySlug(slug);
  if (!page) return { title: "Page not found · Nanosoft Technologies" };
  return {
    title: page.seoTitle || `${page.title} · Nanosoft Technologies`,
    description: page.seoDescription || undefined,
    openGraph: page.ogImage ? { images: [page.ogImage] } : undefined,
  };
}

export default async function CustomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [page, categories, menu, content] = await Promise.all([
    getPublishedPageBySlug(slug),
    listActiveCategoriesWithProducts(),
    listActiveMenu(),
    getSiteContent(),
  ]);
  if (!page) notFound();
  const allProducts = categories.flatMap((c) => c.products);
  const hasHero = page.blocks.some((b) => b.type === "hero" && b.heading);
  return (
    <>
      <Nav menu={menu} phone={content.company.phone} products={allProducts} categories={categories} logo={content.company.logo} />
      <main className="pg-main">
        {!hasHero && <h1 className="bp-title">{page.title}</h1>}
        <PageBlocks blocks={page.blocks} />
      </main>
      <Footer company={content.company} allProducts={allProducts} section={content.sections.footer} />
    </>
  );
}
