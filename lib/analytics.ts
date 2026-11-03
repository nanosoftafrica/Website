/**
 * Google Analytics 4 (GA4) & Tag Management Helper
 * Provides typed tracking functions and declarative data-attribute event interception.
 */

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";

// Track SPA Page Views
export function trackPageView(url: string, gaId?: string) {
  const targetId = gaId || GA_TRACKING_ID;
  if (!targetId || typeof window === "undefined" || !window.gtag) return;
  window.gtag("config", targetId, {
    page_path: url,
  });
}

// Track Custom Event
export function trackEvent(
  action: string,
  params: {
    category?: string;
    label?: string;
    value?: number;
    [key: string]: any;
  } = {}
) {
  if (typeof window === "undefined") return;

  // Log to dataLayer (works for both Google Tag Manager and direct gtag)
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: action,
    event_category: params.category || "General",
    event_label: params.label || "",
    value: params.value,
    ...params,
  });

  if (typeof window.gtag === "function") {
    window.gtag("event", action, {
      event_category: params.category || "General",
      event_label: params.label || "",
      value: params.value,
      ...params,
    });
  }
}

/**
 * Initializes automatic click tracking for declarative HTML elements:
 * e.g. <button data-analytics-event="cta_click" data-analytics-label="Hero Demo" ...>
 */
export function setupDeclarativeAnalytics() {
  if (typeof window === "undefined") return () => {};

  function handleClick(e: MouseEvent) {
    const target = (e.target as HTMLElement)?.closest("[data-analytics-event]");
    if (!target) return;

    const eventName = target.getAttribute("data-analytics-event");
    if (!eventName) return;

    const category = target.getAttribute("data-analytics-category") || "Engagement";
    const label = target.getAttribute("data-analytics-label") || target.textContent?.trim() || "";
    const valueAttr = target.getAttribute("data-analytics-value");
    const value = valueAttr ? parseFloat(valueAttr) : undefined;

    trackEvent(eventName, { category, label, value });
  }

  document.addEventListener("click", handleClick, { capture: true });
  return () => document.removeEventListener("click", handleClick, { capture: true });
}
