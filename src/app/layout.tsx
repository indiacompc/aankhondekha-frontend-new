import type { Metadata } from "next";
import Script from "next/script";
import { Toaster } from "sonner";
import "./globals.css";

const siteUrl = "https://aankhondekha.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Aankhon Dekha - VR Experience Centre",
    template: "%s | Aankhon Dekha",
  },
  description:
    "Experience Madhya Pradesh's rich heritage through immersive VR technology at Aankhon Dekha. Visit our centers in Bhopal and Orchha for an unforgettable journey through history.",
  keywords:
    "VR experience, Madhya Pradesh heritage, Aankhon Dekha, Bhopal VR, Orchha VR, virtual reality tourism, Indian heritage",
  authors: [{ name: "Aniketsingh" }],
  icons: { icon: "/Aankhin Dekha Logo.png" },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Aankhon Dekha",
    title: "Aankhon Dekha - VR Experience Centre",
    description:
      "Experience Madhya Pradesh's rich heritage through immersive VR technology at Aankhon Dekha.",
    images: ["/Aankhin Dekha Logo.png"],
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Aankhon Dekha - VR Experience Centre",
    description:
      "Experience Madhya Pradesh's rich heritage through immersive VR technology at Aankhon Dekha.",
    images: ["/Aankhin Dekha Logo.png"],
  },
  verification: {
    google: "PGy0kpBZbov6jQ72U0Oa1uQgofMYbsZAHRkFyu0b_jY",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Aankhon Dekha",
  description:
    "A New Dimension, where Imagination Meets Immersion. VR experience centre showcasing Madhya Pradesh's heritage.",
  url: siteUrl,
  logo: `${siteUrl}/Aankhin Dekha Logo.png`,
  contactPoint: {
    "@type": "ContactPoint",
    email: "connect@youtellme.ai",
    contactType: "customer service",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster position="top-center" richColors />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />

        {/* Google Analytics — kept off admin routes mirrors the old setup;
            here we load globally and can refine per-route later. */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XYEM1V4MB3"
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XYEM1V4MB3');
          `}
        </Script>
      </body>
    </html>
  );
}
