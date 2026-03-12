/**
 * SSR entry point used by the prerender build script.
 * Imports each public landing page and exports a render function
 * that returns the fully-rendered HTML string for a given route.
 */
import { renderToString } from "react-dom/server";
import { useSyncExternalStore } from "react";
import { Router } from "wouter";

// Landing pages
import Landing from "@/pages/landing";
import AmazonListingTranslation from "@/pages/landing/AmazonListingTranslation";
import ShopifyProductTranslation from "@/pages/landing/ShopifyProductTranslation";
import EtsyListingTranslation from "@/pages/landing/EtsyListingTranslation";
import AmazonDeTranslation from "@/pages/landing/AmazonDeTranslation";
import AmazonJpTranslation from "@/pages/landing/AmazonJpTranslation";

const ROUTE_MAP: Record<string, () => JSX.Element> = {
  "/": Landing,
  "/amazon-listing-translation": AmazonListingTranslation,
  "/shopify-product-translation": ShopifyProductTranslation,
  "/etsy-listing-translation": EtsyListingTranslation,
  "/amazon-de-translation": AmazonDeTranslation,
  "/amazon-jp-translation": AmazonJpTranslation,
};

/**
 * SSR-safe hook for wouter's Router.
 * Returns a fixed path and a no-op navigate function.
 * Provides getServerSnapshot so useSyncExternalStore works during SSR.
 */
function makeStaticHook(path: string) {
  const noop = () => {};
  const subscribe = () => noop;
  const getSnapshot = () => path;

  return () =>
    [useSyncExternalStore(subscribe, getSnapshot, getSnapshot), noop] as [
      string,
      (path: string) => void,
    ];
}

export function render(route: string): string {
  const Component = ROUTE_MAP[route];
  if (!Component) {
    throw new Error(`No component mapped for route: ${route}`);
  }

  const hook = makeStaticHook(route);

  const html = renderToString(
    <Router hook={hook}>
      <Component />
    </Router>,
  );

  // Wrap in a marker div so the client knows to hydrate instead of render
  return `<div data-prerendered="true">${html}</div>`;
}

export const routes = Object.keys(ROUTE_MAP);

/** Per-route SEO metadata, used by the prerender script to inject into the HTML shell. */
export const PAGE_SEO: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Buzztate \u2014 Localize Listings for Amazon, Shopify &amp; Etsy",
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
