import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import { listActiveCategoriesWithProducts, listActiveMenu, getSiteContent } from "@/lib/db";
import { getPublishedPageBySlug, getPageForPreview } from "@/lib/db";
import { getAdminSession } from "@/lib/adminAuth";
import PreviewBanner from "@/components/PreviewBanner";
import PageBlocks from "@/components/PageBlocks";

// Published pages from admin (Website > Extra pages) open at /their-address.
// Fixed routes like /products and /blog always win over this one.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ preview?: string }> };

// ?preview=1 shows a signed-in admin the page as it will look, drafts included.
async function loadPage(slug: string, preview?: string) {
  if (preview && (await getAdminSession())) return { page: await getPageForPreview(slug), isPreview: true };
  return { page: await getPublishedPageBySlug(slug), isPreview: false };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { preview } = await searchParams;
  const { page, isPreview } = await loadPage(slug, preview);
  if (!page) return { title: "Page not found · Nanosoft Technologies" };
  return {
    title: page.seoTitle || `${page.title} · Nanosoft Technologies`,
    description: page.seoDescription || undefined,
    openGraph: page.ogImage ? { images: [page.ogImage] } : undefined,
    ...(isPreview ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function CustomPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const [{ page, isPreview }, categories, menu, content] = await Promise.all([
    loadPage(slug, preview),
    listActiveCategoriesWithProducts(),
    listActiveMenu(),
    getSiteContent(),
  ]);
  if (!page) notFound();
  const allProducts = categories.flatMap((c) => c.products);
  const hasHero = page.blocks.some((b) => b.type === "hero" && b.heading);
  return (
    <>
      {isPreview && (
        <PreviewBanner status={String((page as { status?: string }).status || "")} hasDraft={Boolean((page as { hasDraft?: boolean }).hasDraft)} editHref={`/admin/pages/${page.id}`} />
      )}
      <Nav menu={menu} phone={content.company.phone} products={allProducts} categories={categories} logo={content.company.logo} />
      <main className="pg-main">
        {!hasHero && <h1 className="bp-title">{page.title}</h1>}
        <PageBlocks blocks={page.blocks} />
      </main>
      <Footer company={content.company} allProducts={allProducts} section={content.sections.footer} />
    </>
  );
}
