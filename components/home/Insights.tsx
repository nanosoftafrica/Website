import Link from "next/link";
import type { PostSummary, SectionHeader } from "@/lib/db";
import { colorFor } from "@/lib/colorFor";

function fmtDate(d: string | null): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });
}

export default function Insights({ posts, section }: { posts: PostSummary[]; section?: SectionHeader }) {
  if (!posts.length) return null;
  return (
    <section className="section" id="insights">
      <div className="container">
        <div data-reveal style={{ textAlign: "center", marginBottom: 44 }}>
          <div className="label" style={{ justifyContent: "center" }}>
            {section?.label || "From The Blog"}
          </div>
          <h2 className="sec-h">{section?.heading || "Latest Insights"}</h2>
        </div>
        <div className="insights-grid" data-reveal>
          {posts.map((p) => (
            <Link className="insight-card" data-reveal href={`/blog/${p.slug}`} key={p.id}>
              {p.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="insight-cover" src={p.coverImage} alt={p.title} loading="lazy" />
              ) : (
                <div className="insight-cover-ph" style={{ background: colorFor(p.title) }}>
                  📰
                </div>
              )}
              <div className="insight-body">
                <div className="insight-date">
                  {fmtDate(p.publishedAt || p.createdAt)} · {p.author || ""}
                </div>
                <h4>{p.title}</h4>
                <p>{p.excerpt || ""}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
