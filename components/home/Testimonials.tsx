"use client";

import { useEffect, useState } from "react";
import type { SectionHeader, TestimonialItem } from "@/lib/db";
import { colorFor } from "@/lib/colorFor";

// No hardcoded fallback quotes — showing invented customer testimonials
// when there's no real data is exactly the fabrication problem this
// section was built to avoid. Hide the section until real testimonials
// exist, same pattern as ClientsStrip/Insights.
export default function Testimonials({
  testimonials,
  section,
}: {
  testimonials: TestimonialItem[];
  section?: SectionHeader;
}) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % testimonials.length), 6000);
    return () => clearInterval(id);
  }, [testimonials.length]);

  if (!testimonials.length) return null;
  const t = testimonials[idx];
  const initials = (t.name || "?").slice(0, 2).toUpperCase();

  return (
    <section className="section" id="testimonials">
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: 48 }} data-reveal>
          <div className="label" style={{ justifyContent: "center" }}>
            {section?.label || "What clients say"}
          </div>
          <h2 className="sec-h" style={{ maxWidth: 560, margin: "0 auto" }}>
            {section?.heading || "Real businesses. Real results."}
          </h2>
        </div>
        <div className="testi-center" data-reveal>
          <div className="testi-box">
            <div className="t-stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i}>★</span>
              ))}
            </div>
            <p className="t-quote">&quot;{t.quote}&quot;</p>
            <div className="t-author">
              <div className="t-av" style={{ background: t.photo ? "" : colorFor(t.name) }}>
                {t.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.photo} alt="" />
                ) : (
                  initials
                )}
              </div>
              <div>
                <div className="t-name">{t.name}</div>
                <div className="t-role">{t.role || t.company || ""}</div>
              </div>
            </div>
          </div>
          {testimonials.length > 1 && (
            <div className="t-nav">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  className={`tnd${i === idx ? " active" : ""}`}
                  onClick={() => setIdx(i)}
                  aria-label={`Show testimonial ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
