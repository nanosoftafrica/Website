import type { SectionHeader, Service } from "@/lib/db";
import PainIllustration from "@/components/PainIllustration";

export default function Pain({ services, section }: { services: Service[]; section?: SectionHeader }) {
  if (!services.length) return null;

  return (
    <section className="section" id="pain">
      <div className="container">
        <div className="pain-header" data-reveal>
          <div className="label">{section?.label || "02 · Why Nanosoft"}</div>
          <h2 className="sec-h">{section?.heading || "Sound familiar?"}</h2>
          <p className="sec-p">
            {section?.subhead || "Most growing businesses in Kenya hit the same walls. We built Nanosoft to knock them down."}
          </p>
        </div>
        <div>
          {services.map((s, i) => (
            <div className={`zig-row${i % 2 === 1 ? " zig-reverse" : ""}`} key={i} data-reveal>
              <div className="zig-text">
                <div className="zig-icon">{s.icon || "✨"}</div>
                <h3>{s.title}</h3>
                <p>{s.description}</p>
                {s.solve && <span className="pain-solve">{s.solve}</span>}
              </div>
              <div className="zig-visual">
                {s.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.image} alt={s.title} />
                ) : (
                  <PainIllustration icon={s.icon || "✨"} index={i} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
