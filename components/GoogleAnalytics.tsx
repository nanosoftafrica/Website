"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { trackPageView, setupDeclarativeAnalytics } from "@/lib/analytics";

export default function GoogleAnalytics({
  gaId,
  gtmId,
}: {
  gaId?: string;
  gtmId?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Listen for declarative data-analytics-* clicks
  useEffect(() => {
    const cleanup = setupDeclarativeAnalytics();
    return cleanup;
  }, []);

  // Track page views on route changes
  useEffect(() => {
    if (!gaId) return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    trackPageView(url, gaId);
  }, [pathname, searchParams, gaId]);

  return (
    <>
      {/* Google Tag Manager Container (if GTM ID is supplied) */}
      {gtmId && (
        <Script
          id="google-tag-manager"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');
            `,
          }}
        />
      )}

      {/* Google Analytics 4 (GA4 gtag.js) */}
      {gaId && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          />
          <Script
            id="google-analytics-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}
    </>
  );
}
