import type { Metadata } from "next";
import Script from "next/script";
import { Toaster } from "sonner";
import { CustomerProvider } from "@/components/CustomerProvider";
import { BookingProvider } from "@/components/BookingProvider";
import { AuthProvider } from "@/components/AuthProvider";
import {
  centres,
  contactEmail,
  legalEntity,
  siteUrl,
  socialProfiles,
} from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Aankhon Dekha - VR Experience Centre",
    template: "%s | Aankhon Dekha",
  },
  description:
    "Experience Madhya Pradesh's rich heritage through immersive VR technology at Aankhon Dekha. Visit our centres in Bhopal (State Museum and MPT Boat Club), Orchha and Maheshwar for an unforgettable journey through history.",
  keywords:
    "VR experience, Madhya Pradesh heritage, Aankhon Dekha, Bhopal VR, Orchha VR, Maheshwar VR, virtual reality tourism, Indian heritage",
  // Was authors: [{ name: "Aniketsingh" }] — a developer's name shipped as the
  // page author on every route. The publisher is the company.
  authors: [{ name: legalEntity, url: siteUrl }],
  publisher: legalEntity,
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
  "@id": `${siteUrl}/#organization`,
  name: "Aankhon Dekha",
  legalName: legalEntity,
  description:
    "A New Dimension, where Imagination Meets Immersion. VR experience centre showcasing Madhya Pradesh's heritage.",
  url: siteUrl,
  logo: `${siteUrl}/Aankhin%20Dekha%20Logo.png`,
  // sameAs is what lets Google tie this site, the social profiles and the
  // physical centres together as one entity. It was missing entirely, so each
  // profile was an unconnected island.
  sameAs: socialProfiles,
  contactPoint: {
    "@type": "ContactPoint",
    email: contactEmail,
    contactType: "customer service",
    areaServed: "IN",
    availableLanguage: ["English", "Hindi"],
  },
};

/**
 * One TouristAttraction node per physical centre.
 *
 * TouristAttraction rather than a plain LocalBusiness: these are ticketed
 * visitor attractions inside museums and heritage sites, which is both more
 * accurate and what makes them eligible to surface for "things to do in
 * Orchha"-style queries as well as "VR in Bhopal".
 *
 * The site published no address, phone or geo data in machine-readable form
 * before this, which is why it was absent from the local pack despite four
 * operating locations.
 */
const centresJsonLd = centres.map((centre) => ({
  "@context": "https://schema.org",
  "@type": "TouristAttraction",
  "@id": `${siteUrl}/#centre-${centre.id}`,
  name: centre.name,
  description:
    "Immersive virtual reality experience centre showcasing Madhya Pradesh's heritage.",
  url: `${siteUrl}/contact`,
  telephone: centre.telephone,
  email: contactEmail,
  image: `${siteUrl}/Aankhin%20Dekha%20Logo.png`,
  parentOrganization: { "@id": `${siteUrl}/#organization` },
  address: {
    "@type": "PostalAddress",
    streetAddress: centre.streetAddress,
    addressLocality: centre.addressLocality,
    addressRegion: "Madhya Pradesh",
    postalCode: centre.postalCode,
    addressCountry: "IN",
  },
  // Deliberately omitted: geo coordinates and openingHoursSpecification. Both
  // are strong local-SEO signals, but neither is recorded anywhere in the
  // codebase and inventing them would be worse than leaving them out. Add them
  // here once the real lat/long and opening times are confirmed per centre.
}));

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <CustomerProvider>
            <BookingProvider>{children}</BookingProvider>
          </CustomerProvider>
        </AuthProvider>
        <Toaster position="top-center" richColors />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />

        {centresJsonLd.map((centre) => (
          <script
            key={centre["@id"]}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(centre) }}
          />
        ))}

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
            ${
              // Google Ads conversions need their own config line alongside
              // GA4's. Emitted only when an account has actually been set up —
              // see src/lib/analytics.ts for the two env vars.
              process.env.NEXT_PUBLIC_ADS_CONVERSION_ID
                ? `gtag('config', '${process.env.NEXT_PUBLIC_ADS_CONVERSION_ID}');`
                : ""
            }
          `}
        </Script>
      </body>
    </html>
  );
}
