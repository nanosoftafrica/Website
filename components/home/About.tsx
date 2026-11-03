import type { Company, RoadmapEvent, SectionHeader } from "@/lib/db";

const PIN_COLORS = ["#0096D6", "#005B8E"];

interface Group {
  date: string;
  items: RoadmapEvent[];
}

function groupEvents(events: RoadmapEvent[]): Group[] {
  const groups: Group[] = [];
  events.forEach((e) => {
    const last = groups[groups.length - 1];
    if (last && last.date === (e.date || "")) last.items.push(e);
    else groups.push({ date: e.date || "", items: [e] });
  });
  return groups;
}

export default function About({
  company,
  events,
  section,
}: {
  company: Company;
  events: RoadmapEvent[];
  section?: SectionHeader;
}) {
  if (!company.about && !company.mission && !company.vision) return null;

  const yearsActive = company.foundedYear ? new Date().getFullYear() - company.foundedYear : null;
  const heading =
    section?.heading || (yearsActive ? `${yearsActive}+ Years Serving Kenyan Businesses` : company.name || "Nanosoft Technology");
  const groups = groupEvents(events);

  return (
    <section className="section" id="about" style={{ position: "relative" }}>
      <div className="container" style={{ position: "relative" }}>
        <div className="about-hero">
          <div className="about-intro" data-reveal>
            <div className="label">{section?.label || "01 · Who We Are"}</div>
            <h2 className="sec-h" style={{ maxWidth: 620 }}>
              {heading}
            </h2>
            {company.about && (
              <div className="about-body soft-card">
                <p>{company.about}</p>
              </div>
            )}
            {(yearsActive || company.businessesServed || company.teamSize) && (
              <div className="about-stats">
                {yearsActive && (
                  <div className="about-stat">
                    <div className="about-stat-num">{yearsActive}+</div>
                    <div className="about-stat-label">Years of Experience</div>
                  </div>
                )}
                {company.businessesServed && (
                  <div className="about-stat">
                    <div className="about-stat-num">{company.businessesServed}</div>
                    <div className="about-stat-label">Businesses Served</div>
                  </div>
                )}
                {company.teamSize && (
                  <div className="about-stat">
                    <div className="about-stat-num">{company.teamSize}</div>
                    <div className="about-stat-label">Expert Team</div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="about-visual" data-reveal>
            {company.aboutImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.aboutImage} alt={company.name || "About Nanosoft"} />
            ) : (
              <span className="about-visual-fallback">🏢</span>
            )}
          </div>
        </div>

        {groups.length > 0 && (
          <div className="milestone-grid" data-reveal>
            {groups.map((g, i) => {
              const accent = g.items.some((e) => e.type === "vision") ? "var(--accent)" : PIN_COLORS[i % 2];
              const withImage = g.items.find((e) => e.image);
              const isRowEnd = (i + 1) % 3 === 0;
              return (
                <div className={`ms-card${isRowEnd ? " ms-row-end" : ""}`} data-reveal key={i}>
                  <div className="ms-pin" style={{ background: accent }}>
                    {i + 1}
                  </div>
                  {withImage?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="ms-image" src={withImage.image} alt="" />
                  ) : (
                    <div className="ms-year" style={{ color: accent }}>
                      {g.date}
                    </div>
                  )}
                  {g.items.map((e) => (
                    <div className="rm-entry" key={e.id}>
                      <h4>
                        {e.title}
                        {e.subtitle && <span className="rm-role"> — {e.subtitle}</span>}
                      </h4>
                      {e.description && <p>{e.description}</p>}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        <svg className="connector-line" width="160" height="110" style={{ right: "2%", top: "-30px" }} viewBox="0 0 160 110" aria-hidden="true">
          <path d="M150,100 C 100,100 40,60 10,5" markerEnd="url(#arrowhead-about)" />
          <defs>
            <marker id="arrowhead-about" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="var(--blue-l)" opacity=".6" />
            </marker>
          </defs>
        </svg>
      </div>
    </section>
  );
}
