import type { HeroContent } from "@/lib/db";

export default function Hero({ hero }: { hero: HeroContent }) {
  return (
    <section className="hero" id="home">
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-dots"></div>
        <div className="hero-glow-1"></div>
        <div className="hero-glow-2"></div>
      </div>
      <div className="hero-inner" data-reveal>
        <div className="hero-eyebrow">
          <div className="pill">
            <span className="pill-dot"></span>
            {hero.eyebrow || "25 years serving businesses across Kenya"}
          </div>
        </div>
        <h1>
          {hero.headlineMain || "Run your business"}
          <br />
          without the <em>{hero.headlineEmphasis || "IT headache"}</em>
        </h1>
        <p className="hero-sub">
          {hero.subhead ||
            "Payroll & HR, biometric time & attendance, access control, and CCTV security — built for how Kenyan businesses actually work. Local support that actually shows up. One team, one call."}
        </p>
        <div className="hero-actions">
          <span className="cta-pair">
            <a
              href="/#demo"
              className="btn-hero"
              data-analytics-event="click_cta"
              data-analytics-category="Conversion"
              data-analytics-label="Hero Primary Demo"
            >
              {hero.ctaPrimaryLabel || "Book a Free Demo"}
            </a>
            <a
              href="/#demo"
              className="btn-circle"
              aria-label="Book a free demo"
              data-analytics-event="click_cta"
              data-analytics-category="Conversion"
              data-analytics-label="Hero Circle Demo"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          </span>
          <a
            href="/products"
            className="btn-hero-ghost"
            data-analytics-event="click_cta"
            data-analytics-category="Navigation"
            data-analytics-label="Hero See All Solutions"
          >
            {hero.ctaSecondaryLabel || "See All Solutions"}
          </a>
        </div>
        <svg
          className="connector-line"
          width="220"
          height="140"
          style={{ left: "calc(50% + 260px)", top: "60px" }}
          viewBox="0 0 220 140"
          aria-hidden="true"
        >
          <path d="M10,10 C 90,10 170,40 200,120" markerEnd="url(#arrowhead-hero)" />
          <defs>
            <marker id="arrowhead-hero" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="var(--blue-l)" opacity=".6" />
            </marker>
          </defs>
        </svg>
        {hero.bannerImage && (
          <div className="hero-banner" data-reveal>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="hb-image" src={hero.bannerImage} alt="" />
          </div>
        )}
      </div>
    </section>
  );
}
