import Link from "next/link";
import type { Metadata } from "next";
import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import { listPublishedPosts, listActiveCategoriesWithProducts, listActiveMenu, getSiteContent } from "@/lib/db";

export const metadata: Metadata = {
  title: "Blog & News — Nanosoft Technology",
  description:
    "Latest news, insights and updates from Nanosoft Technology — IT solutions for Africa.",
};

// CMS-editable content — force per-request rendering so admin-panel edits
// (new/edited posts) show immediately instead of waiting for a rebuild.
export const dynamic = "force-dynamic";

function fmtDate(d: string | null): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" });
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const [posts, categories, menu, content] = await Promise.all([
    listPublishedPosts(tag),
    listActiveCategoriesWithProducts(),
    listActiveMenu(),
    getSiteContent(),
  ]);
  const allProducts = categories.flatMap((c) => c.products);

  return (
    <>
      <Nav menu={menu} phone={content.company.phone} products={allProducts} categories={categories} logo={content.company.logo} />
      <main className="bl-main">
        <div className="bl-header">
          <div className="bl-tag">Blog &amp; News</div>
          <h1 className="bl-h1">Insights from Nanosoft</h1>
          <p className="bl-sub">Updates, thought leadership and news from our team across Africa.</p>
          {tag && (
            <div className="bl-filter-chip">
              Filtered by tag <Link href="/blog">✕ clear</Link>
            </div>
          )}
        </div>

        <div className="bl-grid">
          {posts.length === 0 && (
            <div className="bl-empty">
              <h2>No posts{tag ? " with this tag" : " yet"}</h2>
              <p>
                {tag ? (
                  <>
                    Try browsing <Link href="/blog" style={{ color: "var(--blue)" }}>all posts</Link>.
                  </>
                ) : (
                  "Check back soon for news and insights from Nanosoft Technology."
                )}
              </p>
            </div>
          )}

          {posts.map((p) => (
            <div key={p.id} className="bl-card">
              <div className="bl-cover">
                {p.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.coverImage} alt={p.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  "📰"
                )}
              </div>
              <div className="bl-body">
                <div className="bl-meta">
                  <span className="bl-date">{fmtDate(p.publishedAt || p.createdAt)}</span>
                  <span className="bl-author">{p.author}</span>
                </div>
                {p.tags.length > 0 && (
                  <div className="bl-tags">
                    {p.tags.map((t) => (
                      <Link key={t.id} className="bl-pill" href={`/blog?tag=${encodeURIComponent(t.slug)}`}>
                        {t.name}
                      </Link>
                    ))}
                  </div>
                )}
                <Link href={`/blog/${p.slug}`} style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", flex: 1 }}>
                  <h2>{p.title}</h2>
                  <p className="bl-excerpt">{p.excerpt}</p>
                  <span className="bl-read">Read more →</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer company={content.company} allProducts={allProducts} section={content.sections.footer} />
    </>
  );
}
