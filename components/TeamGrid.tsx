import type { TeamMember } from "@/lib/db";

function initialsOf(m: TeamMember): string {
  if (m.initials) return m.initials;
  return m.name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export default function TeamGrid({ team }: { team: TeamMember[] }) {
  if (!team.length) return null;
  return (
    <div className="tm-grid">
      {team.map((m) => (
        <article key={m.id} className="tm-card">
          {m.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="tm-photo" src={m.photo} alt={m.name} loading="lazy" />
          ) : (
            <div className="tm-photo tm-initials" style={{ background: m.gradient || undefined }} aria-hidden="true">
              {initialsOf(m)}
            </div>
          )}
          <h3 className="tm-name">{m.name}</h3>
          {m.role && <p className="tm-role">{m.role}</p>}
          {m.bio && <p className="tm-bio">{m.bio}</p>}
        </article>
      ))}
    </div>
  );
}
