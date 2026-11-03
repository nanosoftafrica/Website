import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import { getPublishedPostBySlug, listActiveCategoriesWithProducts, listActiveMenu, getSiteContent } from "@/lib/db";

// CMS-editable content — force per-request rendering so admin-panel edits
// show immediately instead of waiting for a rebuild.
export const dynamic = "force-dynamic";

function fmtDate(d: string | null): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return { title: "Post not found — Nanosoft Technology" };
  return {
    title: `${post.title} — Nanosoft Technology`,
    description: post.excerpt || undefined,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, categories, menu, content] = await Promise.all([
    getPublishedPostBySlug(slug),
    listActiveCategoriesWithProducts(),
    listActiveMenu(),
    getSiteContent(),
  ]);

  if (!post) {
    notFound();
  }

  const allProducts = categories.flatMap((c) => c.products);

  return (
    <>
      <Nav menu={menu} phone={content.company.phone} products={allProducts} categories={categories} logo={content.company.logo} />
      <main className="bp-main">
        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="bp-cover" src={post.coverImage} alt={post.title} />
        )}
        {post.tags.length > 0 && (
          <div className="bp-tags">
            {post.tags.map((t) => (
              <Link key={t.id} className="bp-pill" href={`/blog?tag=${encodeURIComponent(t.slug)}`}>
                {t.name}
              </Link>
            ))}
          </div>
        )}
        <h1 className="bp-title">{post.title}</h1>
        <div className="bp-meta">
          <span className="bp-author">By {post.author}</span>
          <span className="bp-date">{fmtDate(post.publishedAt || post.createdAt)}</span>
        </div>
        <div className="bp-body" dangerouslySetInnerHTML={{ __html: post.body }} />
        <div className="bp-footer">
          <Link href="/blog" className="btn-back">
            ← All posts
          </Link>
          <a href="/#demo" className="btn-cta">
            Talk to us →
          </a>
        </div>
      </main>
      <Footer company={content.company} allProducts={allProducts} section={content.sections.footer} />
    </>
  );
}
