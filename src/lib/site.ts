/**
 * Canonical site identity and the physical centre data used to build
 * structured data.
 *
 * Kept in one place because the same facts were previously spread across the
 * root layout, the static sitemap and the contact page, and had already drifted
 * apart (the layout still described "centers in Bhopal and Orchha" long after
 * the Boat Club and Maheshwar centres opened).
 */

/**
 * The site's canonical origin.
 *
 * Note the `www.`: https://aankhondekha.com issues a 308 to
 * https://www.aankhondekha.com, so www is the host that actually serves the
 * site. The previous value here was the bare apex, which meant every canonical
 * tag, every og:url and metadataBase pointed at a URL that redirects — search
 * engines had to follow a hop to reach the page the tag was describing, and the
 * declared canonical never matched the served one.
 */
export const siteUrl =
	process.env.NEXT_PUBLIC_SITE_URL || "https://www.aankhondekha.com";

export const legalEntity = "Tellme Digiinfotech Private Limited";

export const contactEmail = "connect@youtellme.ai";

/** Public profiles, used as Organization.sameAs for entity consolidation. */
export const socialProfiles = [
	"https://www.instagram.com/aakhon.dekha/",
	"https://x.com/tellme_360",
	"https://www.linkedin.com/company/tellme-digiinfotech-private-limited/",
	"https://www.youtube.com/channel/UCtp_qdzendr0tf5_tpR9vPg",
	"https://www.facebook.com/profile.php?id=61573881569202",
];

export interface Centre {
	/** Stable slug, used to build @id values. */
	id: string;
	name: string;
	streetAddress: string;
	addressLocality: string;
	postalCode: string;
	telephone: string;
}

/**
 * The physical VR centres, transcribed from the contact page.
 *
 * These drive the LocalBusiness/TouristAttraction structured data. A VR
 * experience centre lives or dies on local discovery — "VR experience in
 * Bhopal", "things to do in Orchha" — and the site published no address,
 * geo or opening data of any kind, so it was invisible to the Google local
 * pack and to AI answers about things to do in these towns.
 */
export const centres: Centre[] = [
	{
		id: "bhopal-state-museum",
		name: "Aankhon Dekha VR and Experience Centre, Bhopal",
		streetAddress:
			"Shyamla Hills Rd, inside State Museum, Tatya Tope Nagar, Shyamla Hills",
		addressLocality: "Bhopal",
		postalCode: "462013",
		telephone: "+91-9039024045",
	},
	{
		id: "orchha-fort",
		name: "Aankhon Dekha VR Centre, Orchha",
		streetAddress: "Fort complex, beside MPT Sheesh Mahal, Fort",
		addressLocality: "Orchha",
		postalCode: "472246",
		// NOTE: the contact page displays 9039024048 but its tel: link points at
		// 9039024049. One of the two is wrong; this uses the displayed number.
		// Worth confirming with the Orchha centre and fixing contact/page.tsx.
		telephone: "+91-9039024048",
	},
	{
		id: "bhopal-boat-club",
		name: "Aankhon Dekha VR Centre, MPT Boat Club",
		streetAddress:
			"Fast 239, inside the Boat Club, below MPT Leher, Bijli Nagar, Kewra Bagh, Transport Nagar",
		addressLocality: "Bhopal",
		postalCode: "462002",
		telephone: "+91-9039024047",
	},
	{
		id: "maheshwar",
		name: "Aankhon Dekha Maheshwar VR Centre",
		streetAddress:
			"Tourism Facilitation Center & Library, Bazaar Square, near Gujarati Handloom",
		addressLocality: "Maheshwar",
		postalCode: "451224",
		telephone: "+91-9039024046",
	},
];

/**
 * Routes that must never be indexed: staff tooling, authenticated customer
 * areas, and mid-funnel booking steps that are meaningless without the session
 * state that precedes them.
 *
 * Shared by robots.ts and sitemap.ts so the two cannot disagree — a URL being
 * submitted in the sitemap while being disallowed in robots.txt is a
 * self-contradiction that Search Console reports as an error.
 */
export const privateRoutes = [
	// Staff and admin tooling. Every one of these is wrapped in <AdminGuard>,
	// including /ticket-booking, which is the Super Admin manual-booking screen
	// rather than the public "book a ticket" page its name suggests.
	"/admin",
	"/admin-dashboard",
	"/admin-ops",
	"/super-admin",
	"/dashboard",
	"/attendance",
	"/slot-generator",
	"/ticket-verification",
	"/ticket-booking",
	"/report",
	"/field-visit",
	// Authenticated customer area and auth screens.
	"/profile",
	"/login",
	"/register",
	// Mid-funnel booking steps. Each one depends on choices made in the
	// previous step, so a crawler landing on them directly gets an empty or
	// broken page.
	"/date-selection",
	"/slot-selection",
	"/ticket-type",
	"/quantity",
	"/payment",
	"/confirmation",
];

/** Publicly indexable routes, with their sitemap weighting. */
export const publicRoutes: {
	path: string;
	changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
	priority: number;
}[] = [
	{ path: "/", changeFrequency: "weekly", priority: 1.0 },
	// The real public booking entry point: every "Book Now" CTA on the home
	// page routes here.
	{ path: "/location", changeFrequency: "weekly", priority: 0.9 },
	{ path: "/about", changeFrequency: "monthly", priority: 0.8 },
	{ path: "/contact", changeFrequency: "monthly", priority: 0.7 },
	{ path: "/newsletter", changeFrequency: "monthly", priority: 0.5 },
	{ path: "/privacy-policy", changeFrequency: "yearly", priority: 0.3 },
	{ path: "/terms-condition", changeFrequency: "yearly", priority: 0.3 },
	{ path: "/cancellation-refund", changeFrequency: "yearly", priority: 0.3 },
];
