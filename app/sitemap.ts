import type { MetadataRoute } from "next";
import { listActiveCategoriesWithProducts, listPublishedPosts, listActiveCaseStudies } from "@/lib/db";

const SITE = (process.env.SITE_URL || "https://ntlafrica.com").replace(/\/+$/, "");

// Rebuilt at most once an hour, so new products and posts show up without a
// rebuild. Drafts, hidden items and admin screens are never listed.
export const revalidate = 3600;

async function safe<T>(load: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await load();
  } catch {
    return fallback;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const fixed: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/products`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/team`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE}/case-studies`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  const [categories, posts, caseStudies] = await Promise.all([
    safe(() => listActiveCategoriesWithProducts(), []),
    safe(() => listPublishedPosts(), []),
    safe(() => listActiveCaseStudies(), []),
  ]);

  const productSlugs = new Set<string>();
  for (const cat of categories as Array<{ products?: Array<{ slug?: string }> }>) {
    for (const p of cat.products ?? []) if (p.slug) productSlugs.add(p.slug);
  }
  const products: MetadataRoute.Sitemap = [...productSlugs].map((slug) => ({
    url: `${SITE}/products/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const blog: MetadataRoute.Sitemap = (posts as Array<{ slug: string; publishedAt?: string | Date | null; createdAt?: string | Date }>)
    .filter((p) => p.slug)
    .map((p) => ({
      url: `${SITE}/blog/${p.slug}`,
      lastModified: new Date(p.publishedAt || p.createdAt || now),
      changeFrequency: "monthly",
      priority: 0.5,
    }));

  const cases: MetadataRoute.Sitemap = (caseStudies as Array<{ slug?: string }>)
    .filter((c) => c.slug)
    .map((c) => ({ url: `${SITE}/case-studies/${c.slug}`, lastModified: now, changeFrequency: "monthly", priority: 0.5 }));

  return [...fixed, ...products, ...blog, ...cases];
}