import { useEffect } from "react";
import { useLocation } from "wouter";
import { BASE_URL, NOINDEX_PATHS, PAGE_SEO } from "@/seo";

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
