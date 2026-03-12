import { useEffect } from "react";
import { useLocation } from "wouter";

const BASE_URL = "https://buzztate.com";
const NOINDEX_PATHS = ["/auth"];

/**
 * Sets <link rel="canonical"> and <meta name="robots"> in <head>
 * based on the current route.
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

    // --- robots (noindex for auth pages) ---
    let meta = document.querySelector<HTMLMetaElement>(
      'meta[name="robots"]',
    );
    const shouldNoindex = NOINDEX_PATHS.some((p) => location.startsWith(p));

    if (shouldNoindex) {
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "robots";
        document.head.appendChild(meta);
      }
      meta.content = "noindex, nofollow";
    } else if (meta) {
      meta.remove();
    }
  }, [location]);
}
