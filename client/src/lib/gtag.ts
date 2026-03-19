/**
 * Google Analytics 4 event tracking helpers.
 * GA4 property: G-7ZX06FWQQC
 *
 * GA4 is loaded dynamically only after the user consents to analytics cookies.
 */

import { hasAnalyticsConsent } from "./cookieConsent";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

const GA_ID = "G-7ZX06FWQQC";
let ga4Loaded = false;

function loadGA4() {
  if (ga4Loaded || typeof document === "undefined") return;
  ga4Loaded = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID);
}

// Returning visitor who already accepted — load immediately
if (hasAnalyticsConsent()) {
  loadGA4();
}

// First-time visitor clicks "Accept" — load on consent event
window.addEventListener("buzztate:consent", ((e: CustomEvent) => {
  if (e.detail === "accepted") loadGA4();
}) as EventListener);

function gtag(...args: any[]) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag(...args);
  }
}

export function trackFileUpload(fileType: string, listingCount: number, sourcePlatform: string) {
  gtag("event", "file_upload", {
    file_type: fileType,
    listing_count: listingCount,
    source_platform: sourcePlatform,
  });
}

export function trackColumnsMapped(autoDetectedCount: number, manualMappedCount: number) {
  gtag("event", "columns_mapped", {
    auto_detected_count: autoDetectedCount,
    manual_mapped_count: manualMappedCount,
  });
}

export function trackLocalizationStarted(
  listingCount: number,
  marketplaceCount: number,
  totalLocalizations: number,
  marketplaces: string[]
) {
  gtag("event", "localization_started", {
    listing_count: listingCount,
    marketplace_count: marketplaceCount,
    total_localizations: totalLocalizations,
    marketplaces: marketplaces.join(","),
  });
}

export function trackLocalizationCompleted(params: {
  listingCount: number;
  marketplaceCount: number;
  totalLocalizations: number;
  successful: number;
  warnings: number;
  failed: number;
  durationSeconds: number;
}) {
  gtag("event", "localization_completed", {
    listing_count: params.listingCount,
    marketplace_count: params.marketplaceCount,
    total_localizations: params.totalLocalizations,
    successful: params.successful,
    warnings: params.warnings,
    failed: params.failed,
    duration_seconds: params.durationSeconds,
  });
}

export function trackFileDownload(downloadType: "zip" | "individual", marketplace: string) {
  gtag("event", "file_download", {
    download_type: downloadType,
    marketplace,
  });
}

export function trackSignUp() {
  gtag("event", "sign_up", { method: "email" });
}

export function trackBeginCheckout() {
  gtag("event", "begin_checkout", {
    currency: "USD",
    value: 49.0,
    items: [{ item_name: "Buzztate Plus", price: 49.0 }],
  });
}

export function trackPurchase(transactionId: string) {
  gtag("event", "purchase", {
    currency: "USD",
    value: 49.0,
    transaction_id: transactionId,
    items: [{ item_name: "Buzztate Plus", price: 49.0 }],
  });
}
