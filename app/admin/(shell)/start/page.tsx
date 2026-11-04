import Link from "next/link";
import { getAdminSession } from "@/lib/adminAuth";
import { hasFullAccess } from "@/lib/adminRoles";

export const dynamic = "force-dynamic";

const WEBSITE_TASKS = [
  { href: "/admin/products", title: "Edit a product", note: "Change a product's text, features or picture, or add a new one" },
  { href: "/admin/posts/new", title: "Post a blog", note: "Write a new article. Set it to Published when it's ready" },
  { href: "/admin/content", title: "Add a client logo", note: "On the Home page screen, open the Clients section" },
  { href: "/admin/content", title: "Edit home page text", note: "Headline, About text and the Book a Demo section" },
  { href: "/admin/content", title: "Update contact and social links", note: "Phone, email and social links. Home page screen, Company section" },
  { href: "/admin/case-studies", title: "Add a case study", note: "A client story for the Case Studies page" },
  { href: "/admin/events", title: "Add an event or milestone", note: "Shows on the timeline in the About section" },
  { href: "/admin/testimonials", title: "Add a testimonial", note: "A customer quote for the home page" },
  { href: "/admin/team", title: "Update the team", note: "Names, roles and photos on the Team and About pages" },
  { href: "/admin/media", title: "Upload images", note: "JPG, PNG or WebP up to 20 MB, GIF up to 5 MB. No SVG files" },
];

const ADMIN_TASKS = [
  { href: "/admin/messages", title: "Check demo requests", note: "Demo requests and messages sent from the website" },
  { href: "/admin/service-requests", title: "Handle a service request", note: "Support tickets from clients" },
  { href: "/admin/dashboard", title: "See the overview", note: "Numbers across sales and support" },
];

function Tile({ href, title, note, external }: { href: string; title: string; note: string; external?: boolean }) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      style={{ display: "block", border: "1px solid rgba(127,127,127,.25)", background: "rgba(127,127,127,.06)", padding: "22px 24px", minHeight: 104, textDecoration: "none", color: "inherit", borderRadius: 12 }}
    >
      <strong style={{ display: "block", fontSize: 18, marginBottom: 6 }}>{title} &rarr;</strong>
      <span style={{ opacity: 0.75, fontSize: 14 }}>{note}</span>
    </Link>
  );
}

export default async function StartPage() {
  const session = await getAdminSession();
  const full = hasFullAccess(session?.role);
  const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16, marginBottom: 32 };
  return (
    <div>
      <h1 className="adm-h1" style={{ marginBottom: 6 }}>What would you like to do?</h1>
      <p style={{ opacity: 0.75, marginBottom: 24 }}>Pick a task. Your changes show on the website as soon as you save. Most screens then give you a View on site link to check it.</p>
      <h2 style={{ fontSize: 15, textTransform: "uppercase", letterSpacing: 1, opacity: 0.7, marginBottom: 12 }}>Website</h2>
      <div style={grid}>
        {WEBSITE_TASKS.map((t) => <Tile key={t.title} {...t} />)}
        <Tile href="/" title="View the website" note="Opens the live site in a new tab" external />
      </div>
      {full && (
        <>
          <h2 style={{ fontSize: 15, textTransform: "uppercase", letterSpacing: 1, opacity: 0.7, marginBottom: 12 }}>Sales and support</h2>
          <div style={grid}>{ADMIN_TASKS.map((t) => <Tile key={t.title} {...t} />)}</div>
        </>
      )}
    </div>
  );
}
