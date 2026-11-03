import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import InteractiveEffects from "@/components/home/InteractiveEffects";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import JsonLd from "@/components/JsonLd";
import { getSiteContent } from "@/lib/db";

export const metadata: Metadata = {
  title: "Nanosoft Technologies",
  description: "IT solutions for Africa — ERP, biometric and managed IT.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await getSiteContent().catch(() => null);
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || content?.seo?.googleAnalyticsId;
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || content?.seo?.googleTagManagerId;

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Sora:wght@700;800&display=swap"
          rel="stylesheet"
        />
        <JsonLd
          title={content?.seo?.title}
          description={content?.seo?.description}
          url={content?.seo?.canonical}
          phone={content?.company?.phone}
          email={content?.company?.email}
        />
      </head>
      <body>
        <InteractiveEffects />
        <Suspense fallback={null}>
          <GoogleAnalytics gaId={gaId} gtmId={gtmId} />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
