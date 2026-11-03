import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import { getActiveCaseStudyBySlug, listActiveCategoriesWithProducts, listActiveMenu, getSiteContent } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const caseStudy = await getActiveCaseStudyBySlug(slug);
  if (!caseStudy) return { title: "Case study not found — Nanosoft Technologies" };
  return {
    title: `${caseStudy.title} — Nanosoft Technologies`,
    description: caseStudy.summary || undefined,
  };
}

export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [caseStudy, categories, menu, content] = await Promise.all([
    getActiveCaseStudyBySlug(slug),
    listActiveCategoriesWithProducts(),
    listActiveMenu(),
    getSiteContent(),
  ]);

  if (!caseStudy) {
    notFound();
  }

  const allProducts = categories.flatMap((c) => c.products);
  const themeVars = { "--pd-color": caseStudy.color, "--pd-bg": caseStudy.bgColor } as React.CSSProperties;

  return (
    <>
      <Nav menu={menu} phone={content.company.phone} products={allProducts} categories={categories} logo={content.company.logo} />
      <main className="pd-main" style={themeVars}>
        <div className="pd-hero">
          <div className="pd-image">
            {caseStudy.heroImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={caseStudy.heroImage} alt={caseStudy.title} />
            ) : (
              <span>📁</span>
            )}
          </div>
          <div>
            {caseStudy.industry && <span className="pd-badge">{caseStudy.industry}</span>}
            <h1 className="pd-title">{caseStudy.title}</h1>
            <div className="pd-subtitle">{caseStudy.client}</div>
            <p className="pd-desc">{caseStudy.summary}</p>
          </div>
        </div>

        <div className="cst-meta-row">
          <div className="cst-meta-item">
            <span className="cst-meta-label">Client</span>
            <span className="cst-meta-value">{caseStudy.client}</span>
          </div>
          {caseStudy.industry && (
            <div className="cst-meta-item">
              <span className="cst-meta-label">Industry</span>
              <span className="cst-meta-value">{caseStudy.industry}</span>
            </div>
          )}
          {caseStudy.location && (
            <div className="cst-meta-item">
              <span className="cst-meta-label">Location</span>
              <span className="cst-meta-value">{caseStudy.location}</span>
            </div>
          )}
        </div>

        {(caseStudy.challenge || caseStudy.solution || caseStudy.outcome) && (
          <div className="cst-narrative">
            {caseStudy.challenge && (
              <div className="cst-narrative-block">
                <h3>The Challenge</h3>
                <p>{caseStudy.challenge}</p>
              </div>
            )}
            {caseStudy.solution && (
              <div className="cst-narrative-block">
                <h3>The Solution</h3>
                <p>{caseStudy.solution}</p>
              </div>
            )}
            {caseStudy.outcome && (
              <div className="cst-narrative-block">
                <h3>The Outcome</h3>
                <p>{caseStudy.outcome}</p>
              </div>
            )}
          </div>
        )}

        {caseStudy.servicesUsed.length > 0 && (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Services delivered</h2>
            <div className="cst-services">
              {caseStudy.servicesUsed.map((s, i) => (
                <span key={i} className="cst-service-pill">{s}</span>
              ))}
            </div>
          </>
        )}

        <div className="pd-cta">
          <h2>Facing a similar challenge?</h2>
          <p>Our team will walk you through a personalised consultation for your site.</p>
          <a href="/#demo" className="pd-btn-hero">
            Book a Free Consultation →
          </a>
        </div>
      </main>
      <Footer company={content.company} allProducts={allProducts} section={content.sections.footer} />
    </>
  );
}
