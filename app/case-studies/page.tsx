import Link from "next/link";
import type { Metadata } from "next";
import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import { listActiveCaseStudies, listActiveCategoriesWithProducts, listActiveMenu, getSiteContent } from "@/lib/db";

export const metadata: Metadata = {
  title: "Case Studies — Nanosoft Technology",
  description: "Real client deployments — smart infrastructure, building management, ERP and access control solutions delivered across Africa.",
};

// Admin-editable — force per-request rendering so admin-panel edits show
// immediately, same reasoning as /products.
export const dynamic = "force-dynamic";

export default async function CaseStudiesPage() {
  const [caseStudies, categories, menu, content] = await Promise.all([
    listActiveCaseStudies(),
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
          <div className="bl-tag">Case Studies</div>
          <h1 className="bl-h1">Real deployments, real clients</h1>
          <p className="bl-sub">A look at how we&apos;ve solved specific infrastructure and operations challenges for organisations across Africa.</p>
        </div>

        {caseStudies.length === 0 ? (
          <div className="bl-empty">
            <h2>No case studies yet</h2>
            <p>Check back soon.</p>
          </div>
        ) : (
          <div className="cst-grid">
            {caseStudies.map((cs) =>
              cs.heroImage ? (
                <Link key={cs.id} href={`/case-studies/${cs.slug}`} className="cst-card cst-card-overlay">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cs.heroImage} alt={cs.title} className="cst-card-cover" />
                  <div className="cst-card-scrim" />
                  <div className="cst-card-body">
                    {cs.industry && <div className="cst-card-industry">{cs.industry}</div>}
                    <h3>{cs.title}</h3>
                    <div className="cst-card-client">{cs.client}{cs.location ? ` · ${cs.location}` : ""}</div>
                    <p>{cs.summary}</p>
                    <span className="cst-card-link">Read the case study →</span>
                  </div>
                </Link>
              ) : (
                <Link key={cs.id} href={`/case-studies/${cs.slug}`} className="cst-card" style={{ borderTopColor: cs.color }}>
                  <div className="cst-card-cover" style={{ background: cs.bgColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
                    📁
                  </div>
                  <div className="cst-card-body">
                    {cs.industry && <div className="cst-card-industry" style={{ color: cs.color }}>{cs.industry}</div>}
                    <h3>{cs.title}</h3>
                    <div className="cst-card-client">{cs.client}{cs.location ? ` · ${cs.location}` : ""}</div>
                    <p>{cs.summary}</p>
                    <span className="cst-card-link" style={{ color: cs.color }}>Read the case study →</span>
                  </div>
                </Link>
              )
            )}
          </div>
        )}
      </main>
      <Footer company={content.company} allProducts={allProducts} section={content.sections.footer} />
    </>
  );
}
