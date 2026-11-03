import type { Client, SectionHeader } from "@/lib/db";

function ClientCard({ c }: { c: Client }) {
  return (
    <span className="client-card">
      {c.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="client-card-logo" src={c.logo} alt={c.name || ""} />
      ) : (
        <span className="client-card-name">{c.name}</span>
      )}
      {c.info && <span className="client-card-info">{c.info}</span>}
    </span>
  );
}

export default function ClientsStrip({ clients, section }: { clients: Client[]; section?: SectionHeader }) {
  if (!clients.length) return null;
  // Duplicate the list once so the CSS marquee can loop seamlessly at -50%.
  const loop = clients.length > 4 ? [...clients, ...clients] : clients;
  return (
    <section className="clients-strip" data-reveal id="clients-strip">
      <div className="container">
        <p className="clients-label">{section?.label || "Trusted by leading organisations across Africa"}</p>
      </div>
      <div className={`clients-marquee${clients.length > 4 ? "" : " clients-marquee-static"}`}>
        <div className="clients-track">
          {loop.map((c, i) => (
            <ClientCard c={c} key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
