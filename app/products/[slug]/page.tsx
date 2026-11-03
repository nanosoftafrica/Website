import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import ProductIllustration from "@/components/ProductIllustration";
import ProductShareBar from "@/components/ProductShareBar";
import { getActiveProductBySlug, listActiveCategoriesWithProducts, listActiveMenu, getSiteContent, type ProductSummary } from "@/lib/db";

// CMS-editable content — force per-request rendering so admin-panel edits
// show immediately instead of waiting for a rebuild.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getActiveProductBySlug(slug);
  if (!product) return { title: "Product not found — Nanosoft Technology" };
  return {
    title: `${product.name} — Nanosoft Technology`,
    description: product.description || undefined,
  };
}

const GROUP_META: Record<string, string> = {
  business: "🔵 Business Services",
  technical: "🟣 Technical Services",
  supporting: "🟡 Supporting Services",
};

function pillLabel(p: ProductSummary) {
  return (
    <>
      {p.name}
      {p.slaLevel === "enterprise" && <span title="Enterprise SLA"> ★</span>}
    </>
  );
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, categories, menu, content] = await Promise.all([
    getActiveProductBySlug(slug),
    listActiveCategoriesWithProducts(),
    listActiveMenu(),
    getSiteContent(),
  ]);

  if (!product) {
    notFound();
  }

  const themeVars = { "--pd-color": product.color, "--pd-bg": product.bgColor } as React.CSSProperties;
  const allProducts = categories.flatMap((c) => c.products);
  const productCategory = categories.find((c) => c.id === product.categoryId);
  const categoryLabel = productCategory?.name || product.category;

  return (
    <>
      <Nav menu={menu} phone={content.company.phone} products={allProducts} categories={categories} logo={content.company.logo} />
      <main className="pd-main" style={themeVars}>
        <div className="pd-hero">
          <div className="pd-image">
            {product.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.image} alt={product.name} />
            ) : (
              <ProductIllustration color={product.color} name={product.name} />
            )}
          </div>
          <div>
            {categoryLabel && <span className="pd-badge">{categoryLabel}</span>}
            <h1 className="pd-title">{product.name}</h1>
            <div className="pd-subtitle">{product.subtitle}</div>
            <p className="pd-desc">{product.description}</p>
            <div className="pd-actions">
              <a href={`/?product=${encodeURIComponent(product.name)}#demo`} className="pd-btn-hero">
                Get a Free Demo →
              </a>
              {product.brochureUrl && (
                <a href={product.brochureUrl} target="_blank" rel="noopener noreferrer" className="pd-btn-brochure">
                  📄 Download Brochure
                </a>
              )}
            </div>
            <ProductShareBar product={product} phone={content.company.phone} />
          </div>
        </div>

        {product.features.length > 0 && (
          <div className="pd-features">
            <h2>Key Features</h2>
            <div className="pd-features-grid">
              {product.features.map((f, i) => (
                <div className="pd-feat-item" key={i}>
                  <div className="pd-feat-check">✓</div>
                  <p>{f}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pd-cta">
          <h2>Ready to try {product.name}?</h2>
          <p>Our team will walk you through a personalised demo and help you get started.</p>
          <a href={`/?product=${encodeURIComponent(product.name)}#demo`} className="pd-btn-hero">
            Book a Free Consultation →
          </a>
        </div>

        {product.benefits.length > 0 && (
          <div className="pd-benefits">
            {product.benefits.map((b, i) => (
              <div className="pd-benefit-item" key={i}>
                <div className="pd-benefit-icon" style={{ color: product.color, background: product.bgColor }}>
                  {b.icon}
                </div>
                <div>
                  <h4>{b.title}</h4>
                  <p>{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pd-other">
          <h2>Other products</h2>
          {Object.keys(GROUP_META).map((type) => {
            const cats = categories.filter((c) => c.serviceType === type && c.products.length > 0);
            if (!cats.length) return null;
            return (
              <div key={type} style={{ marginBottom: 20 }}>
                {cats.map((cat) => (
                  <div key={cat.id} style={{ marginBottom: 12 }}>
                    <div className="pl-cat-name">
                      {cat.icon} {cat.name}
                    </div>
                    <div className="pd-pills">
                      {cat.products.map((p) => (
                        <Link
                          key={p.id}
                          href={`/products/${p.slug}`}
                          className={`pd-pill${p.id === product.id ? " active" : ""}`}
                          style={p.id === product.id ? { borderColor: p.color, color: p.color } : undefined}
                        >
                          {pillLabel(p)}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </main>
      <Footer company={content.company} allProducts={allProducts} section={content.sections.footer} />
    </>
  );
}
