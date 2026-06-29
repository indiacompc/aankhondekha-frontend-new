import type { Metadata } from "next";

interface SeoInput {
  title: string;
  description: string;
  keywords?: string;
  /** Path (e.g. "/about") or absolute URL used for canonical + og:url. */
  path?: string;
  image?: string;
}

/**
 * Build per-page Next.js metadata, mirroring the old <SEO/> component.
 * Defaults (siteName, twitter card, metadataBase) come from the root layout.
 */
export function pageMetadata({
  title,
  description,
  keywords,
  path = "/",
  image = "/Aankhin Dekha Logo.png",
}: SeoInput): Metadata {
  return {
    title,
    description,
    keywords,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      images: [image],
    },
    twitter: {
      title,
      description,
      images: [image],
    },
  };
}
