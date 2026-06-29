import BackButton from "@/components/BackButton";
import Footer from "@/components/Footer";
import { pageMetadata } from "@/lib/seo";
import { CalendarDays, ArrowUpRight, Newspaper } from "lucide-react";

export const metadata = pageMetadata({
  title: "Newsletter Archive | Aankhon Dekha VR Experience Centre",
  description:
    "Read past issues of the Aankhon Dekha newsletter. Updates, visitor stories and behind-the-scenes news from our VR experience centres in Bhopal, Orchha and Maheshwar.",
  keywords:
    "Aankhon Dekha newsletter, VR centre updates, Madhya Pradesh VR news, Bhopal VR newsletter, Orchha VR newsletter, TellMe DigiInfotech newsletter",
  path: "/newsletter",
});

interface NewsletterIssue {
  id: string;
  title: string;
  date: string; // ISO date, e.g. "2025-06-01"
  excerpt: string;
  /** External link to the full issue (PDF / hosted page). Optional. */
  url?: string;
  /** Optional cover image path (served from /public). */
  cover?: string;
}

/**
 * Past newsletter issues, newest first. To add a new issue, prepend an entry
 * here. Set `url` to a hosted PDF/page once available; until then the card
 * shows a "Coming soon" state.
 */
const issues: NewsletterIssue[] = [
  {
    id: "2025-06",
    title: "June 2025 — New Worlds in VR",
    date: "2025-06-01",
    excerpt:
      "A look at the latest immersive experiences launching across our Bhopal, Orchha and Maheshwar centres, plus visitor stories from the past month.",
  },
  {
    id: "2025-05",
    title: "May 2025 — Heritage, Reimagined",
    date: "2025-05-01",
    excerpt:
      "How we are bringing Madhya Pradesh's history to life through virtual reality, and a behind-the-scenes look at our content team.",
  },
  {
    id: "2025-04",
    title: "April 2025 — Welcome to Aankhon Dekha",
    date: "2025-04-01",
    excerpt:
      "Our very first newsletter: the story behind Aankhon Dekha, what to expect on your visit, and what is coming next.",
  },
];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long" });

export default function Newsletter() {
  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col">
      <div className="absolute top-4 left-4 z-50">
        <BackButton />
      </div>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 pt-20 pb-12">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#96FF00]/10 text-[#96FF00]">
              <Newspaper className="w-7 h-7" />
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-aileron text-white">
            Newsletter Archive
          </h1>
          <p className="text-gray-400 mt-3 max-w-xl mx-auto">
            Catch up on past issues — updates, visitor stories and news from
            across our VR experience centres.
          </p>
        </div>

        {issues.length === 0 ? (
          <p className="text-center text-gray-400">
            No issues published yet. Check back soon!
          </p>
        ) : (
          <ul className="space-y-5">
            {issues.map((issue) => {
              const cardInner = (
                <>
                  {issue.cover && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={issue.cover}
                      alt={issue.title}
                      className="w-full sm:w-40 h-32 object-cover rounded-md flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center text-[#96FF00] text-xs mb-2">
                      <CalendarDays className="w-4 h-4 mr-1.5" />
                      {formatDate(issue.date)}
                    </div>
                    <h2 className="text-lg font-aileron text-white">
                      {issue.title}
                    </h2>
                    <p className="text-gray-300 text-sm mt-2">{issue.excerpt}</p>
                    <span className="inline-flex items-center mt-3 text-sm font-medium">
                      {issue.url ? (
                        <span className="text-[#96FF00]">
                          Read issue
                          <ArrowUpRight className="inline w-4 h-4 ml-1" />
                        </span>
                      ) : (
                        <span className="text-gray-500">Coming soon</span>
                      )}
                    </span>
                  </div>
                </>
              );

              return (
                <li key={issue.id}>
                  {issue.url ? (
                    <a
                      href={issue.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col sm:flex-row gap-4 bg-[#1c1c1c] hover:bg-[#242424] border border-white/5 hover:border-[#96FF00]/30 transition-colors rounded-lg p-5"
                    >
                      {cardInner}
                    </a>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-4 bg-[#1c1c1c] border border-white/5 rounded-lg p-5">
                      {cardInner}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </main>

      <Footer />
    </div>
  );
}
