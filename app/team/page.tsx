import type { Metadata } from "next";
import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import { listActiveCategoriesWithProducts, listActiveMenu, getSiteContent } from "@/lib/db";
import { listActiveTeam } from "@/lib/db";
import TeamGrid from "@/components/TeamGrid";

// Shows the team saved in admin (Website > Team) straight away.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our team · Nanosoft Technologies",
  description: "Meet the people behind Nanosoft Technologies Limited.",
};

export default async function TeamPage() {
  const [team, categories, menu, content] = await Promise.all([
    listActiveTeam(),
    listActiveCategoriesWithProducts(),
    listActiveMenu(),
    getSiteContent(),
  ]);
  const allProducts = categories.flatMap((c) => c.products);
  return (
    <>
      <Nav menu={menu} phone={content.company.phone} products={allProducts} categories={categories} logo={content.company.logo} />
      <main className="pg-main">
        <h1 className="bp-title">Our team</h1>
        {team.length ? <TeamGrid team={team} /> : <p className="pg-sub">Team profiles are coming soon.</p>}
      </main>
      <Footer company={content.company} allProducts={allProducts} section={content.sections.footer} />
    </>
  );
}
