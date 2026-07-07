import Link from "next/link";
import Footer from "@/components/Footer";
import { pageMetadata } from "@/lib/seo";
import { Instagram, Facebook, Twitter } from "@/components/icons/social";

export const metadata = pageMetadata({
  title:
    "About Aankhon Dekha - MP VR Center | Madhya Pradesh Heritage VR Experience",
  description:
    "Learn about Aankhon Dekha, the innovative VR experience centre by TellMe DigiInfotech. Discover our immersive 360° VR experiences of Madhya Pradesh's heritage sites in Bhopal and Orchha.",
  keywords:
    "about Aankhon Dekha, MP VR center about, Madhya Pradesh VR centre, TellMe DigiInfotech, Bhopal museum VR, Orchha fort VR, MP heritage VR, Madhya Pradesh virtual reality, MP tourism VR, Bhopal VR experience, Orchha VR experience, MP cultural heritage VR, Indian heritage VR centre",
  path: "/about",
  image: "/about/1_about_us.png",
});

export default function About() {
  return (
    <div className="bg-black text-white min-h-screen">
      <Link href="/">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/Aankhin Dekha Logo.png"
          alt="Aankhin Dekha Logo"
          className="h-10 sm:h-16 object-contain drop-shadow-lg cursor-pointer -mb-20 ml-4"
        />
      </Link>

      {/* Hero Section */}
      <section className="pt-24 text-left px-4 sm:px-8 md:px-12">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold mb-4">
          ABOUT
        </h1>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-300">
          AANKHON DEKHA
        </h2>
      </section>

      {/* Hero Image */}
      <div className="w-full my-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/about/1_about_us.png"
          alt="Aankhon Dekha Intro"
          className="w-full object-cover"
        />
      </div>

      {/* Intro Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 md:px-12 py-4">
        <h3 className="text-2xl font-semibold mb-2">
          Aankhon Dekha: VR Experience Centre
        </h3>
        <p className="text-sm text-gray-400 mb-4" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left Column: Text */}
          <div>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Aankhon Dekha – A New Dimension, where imagination meets immersion.
              Step into the extraordinary with Aankhon Dekha, our brand-new VR
              experience centre by TellMe DigiInfotech Pvt. Ltd — now live in
              Bhopal and Orchha!
            </p>

            <p className="text-gray-300 mb-4 leading-relaxed">
              From majestic forts and timeless temples to vibrant traditions and
              breathtaking landscapes, experience the wonders of India like never
              before — up close, personal, and in stunning 360° VR.
            </p>

            <p className="text-gray-300 leading-relaxed">
              Whether you&apos;re a traveller, student, or explorer at heart,
              Aankhon Dekha takes you beyond boundaries, offering a sensory
              journey where realism meets feel, every story comes alive, and
              every place is within reach.
            </p>

            {/* Book Now (disabled: public online booking not live)
            <div className="flex flex-wrap gap-4 mt-6">
              <Link href="/location">
                {/* eslint-disable-next-line @next/next/no-img-element * /}
                <img
                  src="/about/book_now_about_us.png"
                  alt="Book Now"
                  className="h-12 cursor-pointer hover:scale-105 transition-transform"
                />
              </Link>
            </div>
            */}
          </div>

          {/* Right Column: Images */}
          <div className="grid grid-cols-2 gap-3 self-start">
            <div className="col-span-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/about/2_about_us.png"
                alt="Exhibit 1"
                className="rounded-lg shadow-lg w-full object-cover"
              />
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/about/3_about_us.png"
              alt="Exhibit 2"
              className="rounded-lg shadow-lg w-full object-cover"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/about/4_about_us.png"
              alt="Exhibit 3"
              className="rounded-lg shadow-lg w-full object-cover"
            />
            <div className="flex justify-end gap-4 mt-2 col-span-2">
              <a
                href="https://www.instagram.com/aakhon.dekha/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61573881569202"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://x.com/tellme_360"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition"
              >
                <Twitter size={20} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* About Points */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 md:px-12 py-10 space-y-8">
        <div>
          <h3 className="text-xl font-semibold mb-2">What Aankhon Dekha Does?</h3>
          <p className="text-gray-300 leading-relaxed">
            Offers immersive 360° and VR experiences where visitors can &quot;see
            with their own eyes&quot;. From heritage culture, festivals, tourism,
            and history — everything comes alive through 8K VR films, 3D
            photography, and interactive storytelling.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">
            Identity of Aankhon Dekha
          </h3>
          <p className="text-gray-300 leading-relaxed">
            The name literally translates to &quot;Seen with the Eyes,&quot;
            symbolizing direct and real experiences. It&apos;s closely tied to our
            digital media platform TellMe360.media — a space for heritage stories,
            local culture, and visual archives.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">
            Aankhon Dekha Bhopal: Immersion at the State Museum
          </h3>
          <p className="text-gray-300 leading-relaxed">
            Located within the State Museum, Bhopal — an architectural gem that
            blends innovation, culture, and memories. Visitors can explore
            historic monuments, stories, and immersive exhibits that celebrate
            Madhya Pradesh&apos;s vivid legacy.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">
            Aankhon Dekha Orchha: Walking Through Timeless Heritage
          </h3>
          <p className="text-gray-300 leading-relaxed">
            Inside the Orchha Fort Complex near Sheesh Mahal, step into the
            grandeur of Jahangir Mahal. Witness the rich murals, riverfront views,
            and captivating tales that make Orchha a cultural jewel.
          </p>
        </div>
      </section>

      {/* Flipbook Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 md:px-12 py-16 text-center">
        <h3 className="text-3xl font-semibold mb-4">Dive Into Our Flipbook</h3>
        <iframe
          src="https://heyzine.com/flip-book/9f33a80e30.html#page/2"
          className="fp-iframe"
          style={{ border: "1px solid lightgray", width: "100%", height: "400px" }}
          allowFullScreen
          allow="clipboard-write"
        />
      </section>

      <Footer />
    </div>
  );
}
