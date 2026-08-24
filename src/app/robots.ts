import type { MetadataRoute } from "next";
import { privateRoutes, siteUrl } from "@/lib/site";

/**
 * Replaces the previous static public/robots.txt, which had two problems:
 *
 *  1. Its Sitemap: line pointed at https://aankhon-dekha.com/sitemap.xml — a
 *     hyphenated domain that does not resolve at all (DNS failure). Google was
 *     being handed a dead address, so the sitemap was never fetched from
 *     robots.txt discovery.
 *
 *  2. It was a bare "Allow: /" with no exclusions, leaving every admin screen,
 *     the staff manual-booking tool and the whole authenticated customer area
 *     open to crawlers. /admin and /super-admin both return 200 in production.
 *
 * Generating it here means the sitemap URL and the disallow list are derived
 * from the same constants the sitemap itself uses, so they cannot drift apart.
 */

/**
 * Answer-engine crawlers, opted in by name.
 *
 * A VR experience centre is exactly the kind of thing people now ask an
 * assistant about — "is there a VR experience in Bhopal", "things to do in
 * Orchha" — and the site had no AI-crawler policy at all. Paired with the
 * LocalBusiness data in the root layout and /llms.txt, this is what makes the
 * centres eligible to appear in those answers.
 */
const AI_CRAWLERS = [
	"GPTBot",
	"OAI-SearchBot",
	"ChatGPT-User",
	"PerplexityBot",
	"Perplexity-User",
	"ClaudeBot",
	"Claude-SearchBot",
	"Claude-User",
	"Google-Extended",
	"Applebot-Extended",
];

export default function robots(): MetadataRoute.Robots {
	const baseUrl = siteUrl.replace(/\/$/, "");
	const disallow = ["/api/", ...privateRoutes];

	return {
		rules: [
			{ userAgent: "*", allow: "/", disallow },
			{ userAgent: AI_CRAWLERS, allow: "/", disallow },
		],
		sitemap: `${baseUrl}/sitemap.xml`,
		host: baseUrl,
	};
}
