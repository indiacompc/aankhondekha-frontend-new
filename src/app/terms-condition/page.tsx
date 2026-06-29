import BackButton from "@/components/BackButton";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Terms & Conditions - Aankhon Dekha MP VR Center",
  description:
    "Read the terms and conditions for using Aankhon Dekha VR Experience Centre website and services. Understand booking, payment, and usage policies.",
  keywords:
    "terms conditions Aankhon Dekha, MP VR center terms, VR centre policies, booking terms MP, refund policy VR, Madhya Pradesh VR terms, Bhopal VR booking terms, Orchha VR policies",
  path: "/terms-condition",
});

export default function TermsConditions() {
  return (
    <div className="min-h-screen bg-[#121212] flex justify-center items-center p-4">
      <div className="absolute top-4 left-4 z-50">
        <BackButton />
      </div>
      <div className="max-w-2xl bg-[#595959] text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-lg font-aileron text-center text-white mb-4">
          Terms &amp; Conditions
        </h1>

        <h2 className="text-xl font-aileron text-[#96FF00]">Introduction</h2>
        <p className="mb-4">
          Welcome to Aankhon dekha VR Experience Center, a division of Tellme
          Digiinfotech Pvt Ltd. By using www.aakondekha.com (the &quot;Website&quot;), you
          agree to comply with these Terms &amp; Conditions (&quot;Terms&quot;). If you do
          not agree, do not use this Website.
        </p>

        <h2 className="text-xl font-aileron text-[#96FF00]">Use of Website</h2>
        <p className="mb-4">
          You agree to use the Website lawfully and refrain from any activity
          that disrupts its operation or violates applicable regulations.
        </p>

        <h2 className="text-xl font-aileron text-[#96FF00]">
          Booking &amp; Payments
        </h2>
        <ul className="list-disc pl-6 mb-4">
          <li>All ticket bookings are subject to availability.</li>
          <li>Payments must be made through authorized gateways.</li>
          <li>
            Once a booking is confirmed, it is non-refundable except under
            specified conditions.
          </li>
          <li>
            Users must ensure payment details are accurate to prevent
            transaction failures.
          </li>
          <li>
            Aankhon dekha VR Experience Center is not responsible for payment
            gateway failures.
          </li>
        </ul>

        <h2 className="text-xl font-aileron text-[#96FF00]">
          Intellectual Property
        </h2>
        <p className="mb-4">
          All content, including text, images, and videos, is the property of
          Tellme Digiinfotech Pvt Ltd. Unauthorized use, reproduction, or
          distribution is prohibited.
        </p>

        <h2 className="text-xl font-aileron text-[#96FF00]">User Conduct</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>Users must not post offensive, unlawful, or misleading content.</li>
          <li>Attempt unauthorized access to the Website.</li>
          <li>Use the Website for fraudulent transactions or security breaches.</li>
          <li>Violate intellectual property rights.</li>
        </ul>

        <h2 className="text-xl font-aileron text-[#96FF00]">
          Cancellation &amp; Refund Policy
        </h2>
        <p className="mb-4">
          Bookings are non-refundable unless stated otherwise in specific
          circumstances.
        </p>

        <h2 className="text-xl font-aileron text-[#96FF00]">
          Limitation of Liability
        </h2>
        <ul className="list-disc pl-6 mb-4">
          <li>
            We are not responsible for losses due to technical errors, downtime,
            or payment failures.
          </li>
          <li>Any injuries or accidents at our VR Experience Centers.</li>
          <li>Unauthorized access to user accounts caused by negligence.</li>
          <li>Third-party service provider failures.</li>
        </ul>

        <h2 className="text-xl font-aileron text-[#96FF00]">Indemnification</h2>
        <p className="mb-4">
          Users agree to indemnify Tellme Digiinfotech Pvt Ltd against any claims
          arising from misuse of the Website or violation of these Terms.
        </p>

        <h2 className="text-xl font-aileron text-[#96FF00]">
          Entry &amp; Access Policy
        </h2>
        <ul className="list-disc pl-6 mb-4">
          <li>Entry is open for the booked users only.</li>
          <li>
            QR codes/tickets are non-transferable and valid for a single entry
            only.
          </li>
          <li>
            It is advisable to carry a government-issued photo ID for
            verification by the authorities at the venue.
          </li>
          <li>
            By attending, you consent to event photography and videography for
            promotional use by Tellme.
          </li>
        </ul>

        <h2 className="text-xl font-aileron text-[#96FF00]">
          Modification of Terms
        </h2>
        <p className="mb-4">
          We reserve the right to modify these Terms at any time. Continued use
          of the Website implies acceptance of the updated Terms.
        </p>

        <h2 className="text-xl font-aileron text-[#96FF00]">
          Governing Law &amp; Dispute Resolution
        </h2>
        <p className="mb-4">
          These Terms shall be governed by Indian law, and disputes shall be
          resolved in the courts of Pune in Maharashtra.
        </p>

        <p className="mb-4">
          For inquiries, contact{" "}
          <a
            href="mailto:tellmedigi@outlook.com"
            className="text-[#2C410E] hover:underline"
          >
            tellmedigi@outlook.com
          </a>
        </p>

        <p className="font-aileron">
          By using this Website, you acknowledge and agree to these Terms.
        </p>
      </div>
    </div>
  );
}
