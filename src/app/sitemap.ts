import type { MetadataRoute } from "next";
import { publicRoutes, siteUrl } from "@/lib/site";

/**
 * Replaces the previous hand-maintained public/sitemap.xml.
 *
 * That file listed thirteen URLs, four of which return 404 in production:
 *
 *   /stay-tuned      no such route
 *   /auth            no such route
 *   /Field-visit     the route is lowercase /field-visit (and is staff-only)
 *   /Report          the route is lowercase /report (and is staff-only)
 *
 * It also submitted /login, /register and other funnel pages while omitting
 * /newsletter entirely, and stamped every entry with a hardcoded
 * lastmod of 2025-12-01 that never changed — which teaches Google to ignore
 * our lastmod values altogether.
 *
 * Routes now come from src/lib/site.ts, the same source robots.ts reads its
 * disallow list from, so the sitemap cannot advertise a URL that robots.txt
 * blocks.
 */
export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = siteUrl.replace(/\/$/, "");

	// Build-time date. These are static marketing pages, so their real
	// modification date is the date the site was last deployed.
	const lastModified = new Date();

	return publicRoutes.map((route) => ({
		url: route.path === "/" ? baseUrl : `${baseUrl}${route.path}`,
		lastModified,
		changeFrequency: route.changeFrequency,
		priority: route.priority,
	}));
}
