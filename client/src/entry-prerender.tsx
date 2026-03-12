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

// Blog pages
import BlogList from "@/pages/blog/BlogList";
import BlogPost from "@/pages/blog/BlogPost";
import { BLOG_POSTS } from "@/pages/blog/blogData";

const ROUTE_MAP: Record<string, () => JSX.Element> = {
  "/": Landing,
  "/amazon-listing-translation": AmazonListingTranslation,
  "/shopify-product-translation": ShopifyProductTranslation,
  "/etsy-listing-translation": EtsyListingTranslation,
  "/amazon-de-translation": AmazonDeTranslation,
  "/amazon-jp-translation": AmazonJpTranslation,
  "/blog": BlogList,
  // Individual blog post routes are added dynamically below
};

// Add each blog post as a route
for (const post of BLOG_POSTS) {
  ROUTE_MAP[`/blog/${post.slug}`] = BlogPost;
}

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
