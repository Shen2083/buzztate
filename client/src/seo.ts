/**
 * Shared SEO metadata used by both the client-side useCanonical hook
 * and the prerender pipeline. Single source of truth.
 */
import { BLOG_POSTS } from "@/pages/blog/blogData";

export const BASE_URL = "https://buzztate.com";
export const NOINDEX_PATHS = ["/auth"];

/** Per-route title and meta description overrides. */
export const PAGE_SEO: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Buzztate — Localize Listings for Amazon, Shopify & Etsy",
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
