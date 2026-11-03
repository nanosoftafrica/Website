import type { Metadata } from "next";
import { Suspense } from "react";
import {
  getSiteContent,
  listActiveCategoriesWithProducts,
  listActiveEvents,
  listActiveTestimonials,
  listActiveMenu,
  listPublishedPosts,
} from "@/lib/db";
import Nav from "@/components/home/Nav";
import Hero from "@/components/home/Hero";
import ClientsStrip from "@/components/home/ClientsStrip";
import Testimonials from "@/components/home/Testimonials";
import About from "@/components/home/About";
import Pain from "@/components/home/Pain";
import HowItWorks from "@/components/home/HowItWorks";
import Insights from "@/components/home/Insights";
import DemoForm from "@/components/home/DemoForm";
import Footer from "@/components/home/Footer";
import { ProductSelectionProvider } from "@/components/home/ProductSelectionContext";
import ProductQueryPreselect from "@/components/home/ProductQueryPreselect";

// Every section reads admin-editable CMS content — force per-request
// rendering so admin-panel edits show immediately (see the Products-phase
// staleness bug in squishy-riding-sprout.md for why this is not optional).
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { seo, company } = await getSiteContent();
  const title = seo.title || "Nanosoft Technologies — We Mind Your Business | Nairobi, Kenya";
  const description =
    seo.description ||
    "Nanosoft Technologies delivers ERP, payroll, biometric and managed IT solutions to businesses across Africa. 25+ years. Nairobi, Kenya.";
  return {
    title,
    description,
    alternates: { canonical: seo.canonical || "https://ntlafrica.com" },
    keywords: seo.keywords || undefined,
    openGraph: {
      title,
      description,
      type: "website",
      images: seo.ogImage ? [seo.ogImage] : undefined,
    },
    other: company.foundedYear ? { "og:site_name": company.name || "Nanosoft Technologies" } : undefined,
  };
}

export default async function HomePage() {
  const [content, categories, events, testimonials, menu, featuredPosts] = await Promise.all([
    getSiteContent(),
    listActiveCategoriesWithProducts(),
    listActiveEvents(),
    listActiveTestimonials(),
    listActiveMenu(),
    listPublishedPosts().then((posts) => posts.slice(0, 3)),
  ]);

  const allProducts = categories.flatMap((c) => c.products);

  return (
    <ProductSelectionProvider>
      <Suspense fallback={null}>
        <ProductQueryPreselect />
      </Suspense>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Nanosoft Technologies Limited",
            url: "https://ntlafrica.com",
            telephone: "+254734818350",
            foundingDate: "2001",
            address: { "@type": "PostalAddress", addressLocality: "Nairobi", addressCountry: "KE" },
          }),
        }}
      />
      <Nav menu={menu} phone={content.company.phone} products={allProducts} categories={categories} logo={content.company.logo} />
      <Hero hero={content.hero} />
      <ClientsStrip clients={content.clients} section={content.sections.clients} />
      <Testimonials testimonials={testimonials} section={content.sections.testimonials} />
      <About company={content.company} events={events} section={content.sections.about} />
      <Pain services={content.services} section={content.sections.pain} />
      <HowItWorks steps={content.processSteps} section={content.sections.how} />
      <Insights posts={featuredPosts} section={content.sections.insights} />
      <DemoForm company={content.company} allProducts={allProducts} section={content.sections.demo} />
      <Footer company={content.company} allProducts={allProducts} section={content.sections.footer} />
    </ProductSelectionProvider>
  );
}
