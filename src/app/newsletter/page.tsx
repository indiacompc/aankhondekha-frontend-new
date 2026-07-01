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
 * Past newsletter issues, newest first. Each `url` points to a static HTML
 * issue in /public/newsletter. Cover images use the same hosted URLs the
 * newsletters themselves reference. Dates are approximate — adjust as needed.
 */
const issues: NewsletterIssue[] = [
  {
    id: "2026-education-vr",
    title: "Education Through Virtual Reality",
    date: "2026-01-01",
    excerpt:
      "How immersive VR is transforming classrooms and bringing learning to life for students.",
    url: "/newsletter/2026/Education_Through_Virtual_Reality.html",
    cover: "https://youtellme.ai/newsletters/images/2026.jpeg",
  },
  {
    id: "2025-sanchi-mandu-orchha",
    title: "VR Experience Centre — Sanchi, Mandu, Orchha & Bandhavgarh",
    date: "2025-09-01",
    excerpt:
      "A journey through Madhya Pradesh's iconic heritage sites, brought to life in immersive 360° VR.",
    url: "/newsletter/2025/Aankhon_Dekha_VR_Experience_Sanchi_Mandu_Orchha_Bandhavgarh.html",
  },
  {
    id: "2025-khargone",
    title: "Virtual Reality Training for Women — Khargone",
    date: "2025-08-01",
    excerpt:
      "Empowering women in Khargone with hands-on virtual reality training and new digital skills.",
    url: "/newsletter/2025/Aankhon_Dekha_VR_Experience_Khargone.html",
    cover: "https://youtellme.ai/newsletters/images/khargone.jpeg",
  },
  {
    id: "2025-student",
    title: "State Museum VR Centre — For Students",
    date: "2025-07-01",
    excerpt:
      "Bringing history to life for students through the VR experience centre at the Bhopal State Museum.",
    url: "/newsletter/2025/Aankhon_Dekha_VR_Experience_Student.html",
    cover: "https://youtellme.ai/newsletters/images/student_vr.jpeg",
  },
  {
    id: "2025-orchha-bhopal",
    title: "Immersive Innovation — Orchha & Bhopal",
    date: "2025-06-01",
    excerpt:
      "The latest immersive experiences and stories from our Orchha and Bhopal centres.",
    url: "/newsletter/2025/orchha_bhopal.html",
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
