import BackButton from "@/components/BackButton";
import { pageMetadata } from "@/lib/seo";
import { Globe } from "lucide-react";
import { Facebook, Instagram, Linkedin, Youtube, Twitter } from "@/components/icons/social";

export const metadata = pageMetadata({
  title: "Contact Aankhon Dekha - MP VR Center | Bhopal & Orchha Locations",
  description:
    "Get in touch with Aankhon Dekha VR Experience Centre. Visit us in Bhopal at State Museum or Orchha Fort Complex. Contact details, addresses, and social media links.",
  keywords:
    "contact Aankhon Dekha, MP VR center contact, Bhopal VR center address, Orchha VR center address, TellMe DigiInfotech contact, Madhya Pradesh VR contact, MP tourism contact, Bhopal museum contact, Orchha fort contact, MP heritage VR contact",
  path: "/contact",
});

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-[#121212] flex justify-center items-center p-4">
      <div className="absolute top-4 left-4 z-50">
        <BackButton />
      </div>

      <div className="max-w-2xl bg-[#595959] text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-lg font-aileron text-center text-white mb-4">
          Contact Us
        </h1>

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-aileron text-[#96FF00]">Email</h2>
            <p>
              <a
                href="mailto:connect@youtellme.ai?cc=rashi@youtellme.ai"
                className="text-white hover:underline"
              >
                connect@youtellme.ai
              </a>
            </p>
          </div>

          <div>
            <h2 className="text-lg font-aileron text-[#96FF00]">
              Bhopal Address (Contact Us:{" "}
              <a href="tel:+919039024045" className="text-[#96FF00] hover:underline">
                9039024045
              </a>
              ){" "}
            </h2>
            <p className="text-white">
              Aankhon Dekha VR and Experience Centre Bhopal <br />
              Shyamla Hills Rd, inside State Museum, Tatya Tope Nagar, Shymala
              Hills, Bhopal, Madhya Pradesh 462013, India
            </p>

            <h2 className="text-lg font-aileron text-[#96FF00]">
              Orchha Address (Contact Us:{" "}
              <a href="tel:+919039024049" className="text-[#96FF00] hover:underline">
                9039024048
              </a>
              ){" "}
            </h2>
            <p className="text-white">
              Aankhon Dekha VR Centre Orchha <br />
              Fort complex, beside MPT Sheesh Mahal, Fort, Orchha, Madhya Pradesh
              472246, India
            </p>

            <h2 className="text-lg font-aileron text-[#96FF00]">
              MPT Boat club Address (Contact Us:{" "}
              <a href="tel:+919039024047" className="text-[#96FF00] hover:underline">
                9039024047
              </a>
              ){" "}
            </h2>
            <p className="text-white">
              Aankhon Dekha VR Centre MPT Boat club <br />
              Fast 239, inside the Boat club, below MPT Leher, Bijli Nagar, Kewra
              Bagh, TRANSPORT NAGAR, Bhopal, Madhya Pradesh 462002
            </p>

            <h2 className="text-lg font-aileron text-[#96FF00]">
              Maheshwar Address (Contact Us:{" "}
              <a href="tel:+919039024046" className="text-[#96FF00] hover:underline">
                9039024046
              </a>
              ){" "}
            </h2>
            <p className="text-white">
              Aankhon Dekha Maheshwar VR Centre <br />
              Tourism Facilitation Center &amp; Library Bazaar Square, near
              Gujarati Handloom, Maheshwar, Madhya Pradesh 451224
            </p>

            <h2 className="text-lg font-aileron text-[#96FF00]">
              Development Address
            </h2>
            <p className="text-white">
              Tellme Digiinfotech Pvt. Ltd. <br />
              Office No. 218, Akshay Complex, Balkrishna Sakharam Dhole Patil Rd,
              Sangamvadi, Pune, Maharashtra 411001
            </p>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="mt-6 border-t border-gray-400 pt-4">
          <h2 className="text-lg font-aileron text-[#96FF00] mb-2">Follow Us</h2>
          <div className="flex space-x-4">
            <a
              href="https://www.instagram.com/aakhon.dekha/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#96FF00]"
            >
              <Instagram className="w-6 h-6" />
            </a>
            <a
              href="https://x.com/tellme_360"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#96FF00]"
            >
              <Twitter className="w-6 h-6" />
            </a>
            <a
              href="https://www.linkedin.com/company/tellme-digiinfotech-private-limited/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#96FF00]"
            >
              <Linkedin className="w-6 h-6" />
            </a>
            <a
              href="https://www.youtube.com/channel/UCtp_qdzendr0tf5_tpR9vPg"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#96FF00]"
            >
              <Youtube className="w-6 h-6" />
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61573881569202"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#96FF00]"
            >
              <Facebook className="w-6 h-6" />
            </a>
          </div>

          <div className="mt-4 flex items-center space-x-2">
            <Globe className="w-5 h-5 text-white" />
            <a
              href="https://youtellme.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline hover:text-[#96FF00]"
            >
              youtellme.ai
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
