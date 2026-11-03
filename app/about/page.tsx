import type { Metadata } from "next";
import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import { listActiveCategoriesWithProducts, listActiveMenu, getSiteContent } from "@/lib/db";
import { listActiveEvents, listActiveTeam, getPublishedPageBySlug } from "@/lib/db";
import About from "@/components/home/About";
import TeamGrid from "@/components/TeamGrid";
import PageBlocks from "@/components/PageBlocks";

// The company story from Site content, any published admin page with the
// address "about", then the team. All edited in admin, shown straight away.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedPageBySlug("about");
  return {
    title: page?.seoTitle || "About us · Nanosoft Technologies",
    description: page?.seoDescription || "About Nanosoft Technologies Limited: our story, mission and team.",
  };
}

export default async function AboutPage() {
  const [page, team, events, categories, menu, content] = await Promise.all([
    getPublishedPageBySlug("about"),
    listActiveTeam(),
    listActiveEvents(),
    listActiveCategoriesWithProducts(),
    listActiveMenu(),
    getSiteContent(),
  ]);
  const allProducts = categories.flatMap((c) => c.products);
  return (
    <>
      <Nav menu={menu} phone={content.company.phone} products={allProducts} categories={categories} logo={content.company.logo} />
      <About company={content.company} events={events} section={content.sections.about} />
      {page && page.blocks.length > 0 && (
        <main className="pg-main">
          <PageBlocks blocks={page.blocks} />
        </main>
      )}
      {team.length > 0 && (
        <section className="pg-main">
          <h2 className="bp-title" style={{ fontSize: 32 }}>Our team</h2>
          <TeamGrid team={team} />
        </section>
      )}
      <Footer company={content.company} allProducts={allProducts} section={content.sections.footer} />
    </>
  );
}
