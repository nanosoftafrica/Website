import type { MetadataRoute } from "next";

const SITE = (process.env.SITE_URL || "https://ntlafrica.com").replace(/\/+$/, "");

// Public pages are open to search engines; admin, APIs, field docs and
// previews are not.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/field-docs", "/*?preview="],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}