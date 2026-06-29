import Link from "next/link";
import { Instagram, Facebook, Youtube, Twitter } from "@/components/icons/social";

const quickLinks = [
  { href: "/", label: "HOME" },
  { href: "/about", label: "ABOUT" },
  { href: "/terms-condition", label: "Terms & Conditions" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/cancellation-refund", label: "Cancellation and Refund Policy" },
  { href: "/newsletter", label: "Newsletter" },
  { href: "/contact", label: "Contact Us" },
];

const socials = [
  {
    href: "https://www.instagram.com/aakhon.dekha/",
    label: "Instagram",
    Icon: Instagram,
  },
  {
    href: "https://www.facebook.com/profile.php?id=61573881569202",
    label: "Facebook",
    Icon: Facebook,
  },
  {
    href: "https://www.youtube.com/@AankhonDekhaVR",
    label: "YouTube",
    Icon: Youtube,
  },
  { href: "https://x.com/tellme_360", label: "Twitter", Icon: Twitter },
];

const Footer = () => {
  return (
    <footer className="bg-[#121212] text-white w-full px-8 py-12 mt-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Logo & Description */}
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/TellMe VR Centre Aankhon Dekha Logo.png"
            alt="Aankhon Dekha Logo"
            className="h-40 -mb-5"
          />
          <p className="text-gray-300 text-sm">
            Immersive VR journeys that bring heritage and stories alive for
            everyone.
          </p>
          <p className="text-gray-500 text-xs mt-4">
            © Copyright 2025. Tellme Digilinfotech Pvt. Ltd.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-red-400">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Follow Us On</h3>
          <div className="flex flex-col space-y-2 text-sm text-gray-300">
            {socials.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                className="flex items-center space-x-2 hover:text-red-400"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
          <p className="text-sm text-gray-400 mb-2">CIN: U72900PN2016PTC217592</p>
          <p className="text-sm text-gray-400 font-semibold mb-1">
            Registered &amp; Corporate office:
          </p>
          <p className="text-sm text-gray-400">
            Office No. 228, B Wing, Akshay Complex,
            <br />
            Dhole Patil Road, Pune – 411001
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
