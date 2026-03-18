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

// Shared SEO (single source of truth)
export { PAGE_SEO } from "@/seo";

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
