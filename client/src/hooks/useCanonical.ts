import { useEffect } from "react";
import { useLocation } from "wouter";
import { BLOG_POSTS } from "@/pages/blog/blogData";

const BASE_URL = "https://buzztate.com";
const NOINDEX_PATHS = ["/auth"];

/** Per-route title and meta description overrides. */
const PAGE_SEO: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Buzztate \u2014 Localize Listings for Amazon, Shopify & Etsy",
    description:
      "Buzztate converts and localizes Amazon, Shopify, and Etsy listings across platforms and languages. 5 markets, one upload. Try 5 listings free.",
  },
  "/amazon-listing-translation": {
    title: "Amazon Listing Localization for Sellers | Buzztate",
    description:
      "Localize your Amazon listings with marketplace-aware AI. Keyword-optimized bullet points, titles, and descriptions for every Amazon marketplace.",
  },
  "/shopify-product-translation": {
    title: "Shopify Product Localization for Sellers | Buzztate",
    description:
      "Convert Shopify products into marketplace-ready Amazon or Etsy listings. Buzztate maps fields, generates missing content, and localizes for each market.",
  },
  "/etsy-listing-translation": {
    title: "Etsy Listing Localization for Sellers | Buzztate",
    description:
      "Turn Etsy listings into Amazon-ready files with localized titles, generated bullet points, and marketplace-optimized keywords. One upload, every market.",
  },
  "/amazon-de-translation": {
    title: "Localize Listings for Amazon Germany | Buzztate",
    description:
      "Localize your listings for Amazon Germany. German compound search terms, marketplace-compliant bullet points, and cultural adaptation built in.",
  },
  "/amazon-jp-translation": {
    title: "Localize Listings for Amazon Japan | Buzztate",
    description:
      "Localize your listings for Amazon Japan. Polite keigo language, detailed specifications, and Japanese search keyword optimization built in.",
  },
  "/blog": {
    title: "Blog | Buzztate",
    description:
      "Guides, tips, and insights for e-commerce sellers expanding internationally with Buzztate.",
  },
};

// Add per-post SEO from blog data
for (const post of BLOG_POSTS) {
  PAGE_SEO[`/blog/${post.slug}`] = {
    title: `${post.title} | Buzztate`,
    description: post.excerpt,
  };
}

const DEFAULT_SEO = PAGE_SEO["/"];

/**
 * Sets <link rel="canonical">, <title>, <meta name="description">,
 * <meta property="og:description">, <meta name="twitter:description">,
 * and <meta name="robots"> in <head> based on the current route.
 */
export function useCanonical() {
  const [location] = useLocation();

  useEffect(() => {
    // --- canonical ---
    const canonicalHref =
      location === "/" ? `${BASE_URL}/` : `${BASE_URL}${location}`;

    let link = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = canonicalHref;

    // --- title + descriptions ---
    const seo = PAGE_SEO[location] ?? DEFAULT_SEO;
    document.title = seo.title;

    const descMeta = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    if (descMeta) descMeta.content = seo.description;

    const ogDesc = document.querySelector<HTMLMetaElement>(
      'meta[property="og:description"]',
    );
    if (ogDesc) ogDesc.content = seo.description;

    const twDesc = document.querySelector<HTMLMetaElement>(
      'meta[name="twitter:description"]',
    );
    if (twDesc) twDesc.content = seo.description;

    // --- robots (noindex for auth pages) ---
    let robotsMeta = document.querySelector<HTMLMetaElement>(
      'meta[name="robots"]',
    );
    const shouldNoindex = NOINDEX_PATHS.some((p) => location.startsWith(p));

    if (shouldNoindex) {
      if (!robotsMeta) {
        robotsMeta = document.createElement("meta");
        robotsMeta.name = "robots";
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.content = "noindex, nofollow";
    } else if (robotsMeta) {
      robotsMeta.remove();
    }
  }, [location]);
}
