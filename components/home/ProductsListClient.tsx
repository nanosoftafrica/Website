"use client";

import { useEffect, useState } from "react";
import ProductIllustration from "@/components/ProductIllustration";
import ProductShareBar from "@/components/ProductShareBar";
import type { CategoryWithProducts, ProductSummary } from "@/lib/db";

const GROUP_META: Record<string, string> = {
  business: "🔵 Business Services",
  technical: "🟣 Technical Services",
  supporting: "🟡 Supporting Services",
};

export default function ProductsListClient({ categories }: { categories: CategoryWithProducts[] }) {
  const [selected, setSelected] = useState<{ product: ProductSummary; categoryName: string } | null>(null);

  // Escape key + body-scroll lock while the modal is open, same UX
  // conventions as the admin panel's .adm-modal.
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [selected]);

  const product = selected?.product;
  const themeVars = product
    ? ({ "--pd-color": product.color, "--pd-bg": product.bgColor } as React.CSSProperties)
    : undefined;

  return (
    <>
      {Object.keys(GROUP_META).map((type) => {
        const cats = categories.filter((c) => c.serviceType === type && c.products.length > 0);
        if (!cats.length) return null;
        return (
          <div className="pl-group" key={type}>
            <div className="pl-group-label">{GROUP_META[type]}</div>
            {cats.map((cat) => (
              <div className="pl-cat-block" id={cat.slug} key={cat.id}>
                <div className="pl-cat-name">
                  <span>{cat.icon}</span> {cat.name}
                </div>
                <div className="pl-grid">
                  {cat.products.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className="pl-card"
                      style={{ borderTopColor: p.color }}
                      onClick={() => setSelected({ product: p, categoryName: cat.name })}
                    >
                      {p.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image} alt={p.name} className="pl-card-cover" />
                      ) : null}
                      <div className="pl-card-body">
                        <div className="pl-card-dot" style={{ background: p.bgColor, color: p.color }}>
                          {cat.icon}
                        </div>
                        <h3>
                          {p.name}
                          {p.slaLevel === "enterprise" && (
                            <span className="pl-sla" title="Enterprise SLA">★</span>
                          )}
                        </h3>
                        <p>{p.subtitle}</p>
                        <span className="pl-card-link" style={{ color: p.color }}>
                          Learn more →
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {product && (
        <div className="pd-modal-backdrop" onClick={() => setSelected(null)}>
          <div className="pd-modal" style={themeVars} onClick={(e) => e.stopPropagation()}>
            <button type="button" className="pd-modal-close" onClick={() => setSelected(null)} aria-label="Close">
              ×
            </button>
            <div className="pd-modal-body">
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
                  <span className="pd-badge">{selected!.categoryName}</span>
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
                  <ProductShareBar product={product} />
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

              <div className="pd-cta">
                <h2>Ready to try {product.name}?</h2>
                <p>Our team will walk you through a personalised demo and help you get started.</p>
                <a href={`/?product=${encodeURIComponent(product.name)}#demo`} className="pd-btn-hero">
                  Book a Free Consultation →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
