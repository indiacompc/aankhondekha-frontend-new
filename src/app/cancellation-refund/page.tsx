import BackButton from "@/components/BackButton";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Cancellation & Refund Policy - Aankhon Dekha MP VR Center",
  description:
    "Read the cancellation and refund policy for Aankhon Dekha VR Experience Centre. Understand booking cancellation terms and refund conditions.",
  keywords:
    "cancellation policy Aankhon Dekha, refund policy MP VR center, booking cancellation Bhopal, ticket refund Orchha, VR experience refund",
  path: "/cancellation-refund",
});

export default function CancellationRefund() {
  return (
    <div className="min-h-screen bg-[#121212] flex justify-center items-center p-4">
      <div className="absolute top-4 left-4 z-50">
        <BackButton />
      </div>
      <div className="max-w-2xl bg-[#595959] text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-lg font-aileron text-center text-white mb-4">
          Cancellation and Refund policy
        </h1>
        <ul className="list-disc pl-6 space-y-2 text-white">
          <li>
            Once a booking is confirmed, it is non-refundable except under
            specified conditions.
          </li>
          <li>Once a booking is confirmed, it is non-cancellable.</li>
        </ul>
      </div>
    </div>
  );
}
