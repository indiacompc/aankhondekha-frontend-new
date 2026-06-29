import BackButton from "@/components/BackButton";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy Policy - Aankhon Dekha MP VR Center",
  description:
    "Read our privacy policy to understand how Aankhon Dekha collects, uses, and protects your personal information. Learn about data security and user rights.",
  keywords:
    "privacy policy Aankhon Dekha, MP VR center privacy, data protection VR, user rights MP, personal information VR, Madhya Pradesh VR privacy, Bhopal VR data protection, Orchha VR privacy policy",
  path: "/privacy-policy",
});

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#121212] flex justify-center items-center p-4">
      <div className="absolute top-4 left-4 z-50">
        <BackButton />
      </div>
      <div className="max-w-2xl bg-[#595959] text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-lg font-aileron text-center text-white mb-4">
          Privacy Policy
        </h1>

        <h2 className="text-xl font-aileron text-[#96FF00] mt-6">Introduction</h2>
        <p>
          Welcome to Aankhon Dekha VR Experience Center, a division of Tellme
          Digiinfotech Pvt Ltd (&quot;we,&quot; &quot;our,&quot; &quot;us&quot;). This Privacy Policy
          explains how we collect, use, disclose, and safeguard your information
          when you visit our website –{" "}
          <a href="http://aankhondekha.com/" className="text-white hover:underline">
            www.aakondekha.com
          </a>
        </p>

        <h2 className="text-xl font-aileron text-[#96FF00] mt-6">
          Information We Collect
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Personal Information:</strong> Name, email, contact number,
            billing address, and payment details when booking tickets.
          </li>
          <li>
            <strong>Non-Personal Information:</strong> Device type, browser
            details, IP address, and browsing behavior collected via cookies.
          </li>
          <li>
            <strong>Transaction Details:</strong> Data related to bookings and
            transactions.
          </li>
          <li>
            <strong>Location Data:</strong> Collected with user consent for
            service customization.
          </li>
        </ul>

        <h2 className="text-xl font-aileron text-[#96FF00] mt-6">
          Use of Your Information
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>To process and confirm your bookings.</li>
          <li>To provide customer support.</li>
          <li>To personalize user experience.</li>
          <li>To improve services via analytics.</li>
          <li>To comply with legal requirements.</li>
        </ul>

        <h2 className="text-xl font-aileron text-[#96FF00] mt-6">
          Disclosure of Your Information
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Service Providers:</strong> Third parties handling payments,
            marketing, and support.
          </li>
          <li>
            <strong>Legal Compliance:</strong> Information may be disclosed if
            required by law.
          </li>
        </ul>

        <h2 className="text-xl font-aileron text-[#96FF00] mt-6">
          Security of Your Information
        </h2>
        <p>
          We take measures to protect your data but cannot guarantee absolute
          security due to the nature of digital transactions.
        </p>

        <h2 className="text-xl font-aileron text-[#96FF00] mt-6">
          Cookies &amp; Tracking Technologies
        </h2>
        <p>
          We use cookies to enhance user experience. You can manage cookie
          preferences in your browser settings.
        </p>

        <h2 className="text-xl font-aileron text-[#96FF00] mt-6">User Rights</h2>
        <p>You may request access, updates, or deletion of your personal data.</p>
        <p>
          Contact us at:{" "}
          <a
            href="mailto:tellmedigi@outlook.com"
            className="text-white hover:underline"
          >
            tellmedigi@outlook.com
          </a>
        </p>

        <h2 className="text-xl font-aileron text-[#96FF00] mt-6">
          Changes to Privacy Policy
        </h2>
        <p>
          We may update this policy periodically. Continued use of our services
          means acceptance of the updated policy.
        </p>

        <h2 className="text-xl font-aileron text-[#96FF00] mt-6">
          Refund &amp; cancellation policy
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Once a booking is confirmed, it is non-refundable except under
            specified conditions.
          </li>
          <li>Once a booking is confirmed, it is non-cancellable.</li>
        </ul>

        <h2 className="text-xl font-aileron text-[#96FF00] mt-6">
          Shipping Policy
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Not Applicable</li>
        </ul>

        <h2 className="text-xl font-aileron text-[#96FF00] mt-6">Contact Us</h2>
        <p>
          For privacy concerns, contact :{" "}
          <a
            href="mailto:connect@youtellme.ai"
            className="text-white hover:underline"
          >
            connect@youtellme.ai
          </a>
        </p>
      </div>
    </div>
  );
}
