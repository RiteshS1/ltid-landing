import type { MetadataRoute } from "next";
import { INDEXABLE, SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // Crawling stays allowed so crawlers can read the page-level noindex directive.
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: INDEXABLE ? `${SITE_URL}/sitemap.xml` : undefined,
    host: SITE_URL,
  };
}
