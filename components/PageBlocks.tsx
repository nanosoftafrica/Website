/* eslint-disable @next/next/no-img-element */
import type { PageBlock } from "@/lib/db";

// Renders the blocks a page is built from in admin (Website > Extra pages):
// hero, rich text, image and call to action.
export default function PageBlocks({ blocks }: { blocks: PageBlock[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        if (b.type === "hero") {
          return (
            <section key={i} className="pg-hero">
              {b.image && <img className="bp-cover" src={b.image} alt={b.heading || ""} />}
              {b.heading && <h1 className="bp-title">{b.heading}</h1>}
              {b.subheading && <p className="pg-sub">{b.subheading}</p>}
              {b.ctaText && b.ctaHref && <a className="btn-cta" href={b.ctaHref}>{b.ctaText}</a>}
            </section>
          );
        }
        if (b.type === "richtext") {
          return <div key={i} className="bp-body" dangerouslySetInnerHTML={{ __html: b.html || "" }} />;
        }
        if (b.type === "image" && b.url) {
          return (
            <figure key={i} className="pg-figure">
              <img src={b.url} alt={b.alt || b.caption || ""} loading="lazy" />
              {b.caption && <figcaption>{b.caption}</figcaption>}
            </figure>
          );
        }
        if (b.type === "cta") {
          return (
            <section key={i} className="pg-cta">
              {b.heading && <h2>{b.heading}</h2>}
              {b.text && <p>{b.text}</p>}
              {b.buttonText && b.buttonHref && <a className="btn-cta" href={b.buttonHref}>{b.buttonText}</a>}
            </section>
          );
        }
        return null;
      })}
    </>
  );
}
