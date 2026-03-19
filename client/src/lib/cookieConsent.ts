const CONSENT_KEY = "buzztate_cookie_consent";

export type ConsentChoice = "accepted" | "rejected";

export function getConsent(): ConsentChoice | null {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    if (value === "accepted" || value === "rejected") return value;
    return null;
  } catch {
    return null;
  }
}

export function setConsent(choice: ConsentChoice): void {
  try {
    localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    // localStorage unavailable
  }
  window.dispatchEvent(new CustomEvent("buzztate:consent", { detail: choice }));
}

export function hasAnalyticsConsent(): boolean {
  return getConsent() === "accepted";
}
