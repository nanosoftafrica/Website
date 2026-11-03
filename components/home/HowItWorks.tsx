import type { ProcessStep, SectionHeader } from "@/lib/db";

const TONES = ["blue", "accent"];

export default function HowItWorks({ steps, section }: { steps: ProcessStep[]; section?: SectionHeader }) {
  return (
    <section className="section" id="how">
      <div className="container">
        <div data-reveal style={{ maxWidth: 600, marginBottom: 0 }}>
          <div className="label">{section?.label || "04 · How It Works"}</div>
          <h2 className="sec-h">{section?.heading || `Up and running in ${steps.length || 3} steps`}</h2>
          <p className="sec-p">
            {section?.subhead || "No long procurement cycles. No consultant hand-off. Our team works with you directly from day one."}
          </p>
        </div>
        <div className="how-grid" data-reveal>
          {steps.map((p, i) => (
            <div className="how-card" data-tone={TONES[i % TONES.length]} key={i}>
              <div className="how-num">{p.number || i + 1}</div>
              {p.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="how-photo" src={p.image} alt="" />
              ) : (
                <div className="how-icon">{p.icon || "✨"}</div>
              )}
              <h3>{p.title}</h3>
              <p>{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
