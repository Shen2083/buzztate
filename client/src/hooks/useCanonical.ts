import { useEffect } from "react";
import { useLocation } from "wouter";

const BASE_URL = "https://buzztate.com";
const NOINDEX_PATHS = ["/auth"];

/** Per-route title and meta description overrides. */
const PAGE_SEO: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Buzztate \u2014 Localize Listings for Amazon, Shopify & Etsy",
    description:
      "Upload Amazon, Shopify, or Etsy listings. Get localized, marketplace-ready files for 5 international markets. Try 5 listings free.",
  },
  "/amazon-listing-translation": {
    title: "Amazon Listing Localization for Sellers | Buzztate",
    description:
      "Localize Amazon listings for Germany, France, Spain, Italy, and Japan. Marketplace-optimized titles, bullets, and keywords. Try free.",
  },
  "/shopify-product-translation": {
    title: "Shopify Product Localization for Sellers | Buzztate",
    description:
      "Translate and localize Shopify products with SEO-optimized titles, descriptions, and meta tags for international stores. Try free.",
  },
  "/etsy-listing-translation": {
    title: "Etsy Listing Localization for Sellers | Buzztate",
    description:
      "Localize Etsy listings with marketplace-optimized tags, titles, and descriptions that preserve your artisan tone. Try free.",
  },
  "/amazon-de-translation": {
    title: "Localize Listings for Amazon Germany | Buzztate",
    description:
      "Translate Amazon listings to German with compound nouns, metric units, and backend keywords optimized for Amazon.de search. Try free.",
  },
  "/amazon-jp-translation": {
    title: "Localize Listings for Amazon Japan | Buzztate",
    description:
      "Translate Amazon listings to Japanese with keigo language, detailed specs, and katakana brand names for Amazon.co.jp. Try free.",
  },
};

const DEFAULT_SEO = PAGE_SEO["/"];

/**
 * Sets <link rel="canonical">, <title>, <meta name="description">,
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

    // --- title + description ---
    const seo = PAGE_SEO[location] ?? DEFAULT_SEO;
    document.title = seo.title;

    const descMeta = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    if (descMeta) {
      descMeta.content = seo.description;
    }

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
