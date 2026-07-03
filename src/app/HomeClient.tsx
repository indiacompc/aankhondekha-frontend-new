"use client";

/* eslint-disable @next/next/no-img-element */

import { useState, useRef, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AttractionsSection from "@/components/AttractionsSection";
import Testimonial from "@/components/Testimonial";
import Footer from "@/components/Footer";
import { Star } from "lucide-react";
import LazyVideo from "@/components/LazyVideo";

interface Review {
  name: string;
  text: ReactNode;
  rating: number;
  avatar: string;
  location: string;
}

const BHOPAL_MAP =
  "https://www.google.com/maps/place/Aankhon+Dekha+VR+and+Experience+Centre+Bhopal/";
const ORCHHA_MAP =
  "https://www.google.com/maps/place/Aankhon+Dekha+VR+Centre+Orchha/";

const link =
  "text-cyan-400 hover:text-cyan-300 cursor-pointer underline font-bold";

const HomeClient = () => {
  const router = useRouter();
  const [isReviewsScrolling, setIsReviewsScrolling] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const reviewsScrollContainerRef = useRef<HTMLDivElement>(null);
  const videoIframeRef = useRef<HTMLIFrameElement>(null);

  const testimonials: Review[] = [
    {
      name: "Gopal Agarwal",
      text: (
        <>
          This is a{" "}
          <span className={link} onClick={() => window.open(BHOPAL_MAP, "_blank")}>
            good
          </span>{" "}
          place to visit for kids and adults who are really interested to know
          the culture and history of MP. Must visit this place at least once and
          everybody will enjoy this virtual reality show.
        </>
      ),
      rating: 5,
      avatar: "🌍",
      location: "Bhopal",
    },
    {
      name: "Prakhar Paawan Saxena 'Inqalab'",
      text: (
        <>
          This was a 10 minute experience in just ₹100 (Date of Experience - 17th
          August 2025) Worth watching.....{" "}
          <span className={link} onClick={() => window.open(ORCHHA_MAP, "_blank")}>
            Fabulous
          </span>{" "}
          experience one should not miss. MP tourism should be appreciated.
        </>
      ),
      rating: 5,
      avatar: "👨‍💼",
      location: "Orchha",
    },
    {
      name: "Mamatha Gowda",
      text: (
        <>
          <span className={link} onClick={() => window.open(BHOPAL_MAP, "_blank")}>
            Amazing
          </span>{" "}
          experience... No words to explain the experience, but only then can we
          get to know the value of our diversity. Sakshi explained it well and
          good. I enjoyed a lot 😄
        </>
      ),
      rating: 5,
      avatar: "👩‍🎓",
      location: "Bhopal",
    },
    {
      name: "santosh puri",
      text: (
        <>
          {" "}
          <span className={link} onClick={() => window.open(ORCHHA_MAP, "_blank")}>
            Very amazing
          </span>
          ............ I think it is super very innovative idea for senior
          citizens and also for children................. But need more best
          pictures and videos can add in about Orchha&apos;s ................ I
          hope it will seen audience soon
        </>
      ),
      rating: 5,
      avatar: "🌸",
      location: "Orchha",
    },
    {
      name: "ICL Shruti",
      text: (
        <>
          <span className={link} onClick={() => window.open(BHOPAL_MAP, "_blank")}>
            Loved
          </span>{" "}
          the experience at Aankhon Dekha VR! Planning to send my family and
          friends next time.
        </>
      ),
      rating: 5,
      avatar: "👩‍💻",
      location: "Bhopal",
    },
    {
      name: "Shubham Jha",
      text: (
        <>
          Just had a VR tour of Sanchi, Orchha and Mandu at Aankhon Dekha, and it
          was{" "}
          <span className={link} onClick={() => window.open(ORCHHA_MAP, "_blank")}>
            absolutely amazing
          </span>
          !! If you&apos;re visiting Orchha, DO NOT skip this small experience
          centre right beside the Raja Mahal ticket counter!
        </>
      ),
      rating: 5,
      avatar: "🎮",
      location: "Orchha",
    },
    {
      name: "komal singh",
      text: (
        <>
          The place is{" "}
          <span className={link} onClick={() => window.open(BHOPAL_MAP, "_blank")}>
            fun
          </span>
          … VR show is good
        </>
      ),
      rating: 5,
      avatar: "🎨",
      location: "Bhopal",
    },
    {
      name: "neeraj panwar",
      text: (
        <>
          {" "}
          <span className={link} onClick={() => window.open(ORCHHA_MAP, "_blank")}>
            a great
          </span>{" "}
          experience to have.. we didn&apos;t have enough time to visit all the
          places.. but with the help of this we experienced everything and it was
          absolutely fabulous
        </>
      ),
      rating: 5,
      avatar: "📸",
      location: "Orchha",
    },
    {
      name: "akilesh bhounsley",
      text: (
        <>
          It&apos;s very good to hear of a VR experience centre in Bhopal. Looks
          great and Kudos to the MP Government for this progressive step and the
          company Aankhon Dekha for execution of this beautiful VR centre. Bit{" "}
          <span className={link} onClick={() => window.open(BHOPAL_MAP, "_blank")}>
            surprised
          </span>{" "}
          to see it is open till 5PM. Will consider visiting when I come to India
          next with family.
        </>
      ),
      rating: 5,
      avatar: "🌟",
      location: "Bhopal",
    },
    {
      name: "Rsatyam Parihar",
      text: (
        <>
          This is{" "}
          <span className={link} onClick={() => window.open(ORCHHA_MAP, "_blank")}>
            very good
          </span>{" "}
          technology that has been introduced in Orchha, which will give tourists
          a new experience in Orchha and they will be able to see the heritage and
          monuments of Orchha closely.
        </>
      ),
      rating: 5,
      avatar: "🏛️",
      location: "Orchha",
    },
    {
      name: "TANUJ SHARMA",
      text: (
        <>
          Went on a 10 min immersive walk to some{" "}
          <span className={link} onClick={() => window.open(BHOPAL_MAP, "_blank")}>
            wonderful
          </span>{" "}
          sites of MP through virtual reality, liked every minute of it, wonderful
          experience, the guy who assisted was cordial too.
        </>
      ),
      rating: 5,
      avatar: "👨‍🏫",
      location: "Bhopal",
    },
    {
      name: "Noor Ishtiyaq",
      text: (
        <>
          One of{" "}
          <span className={link} onClick={() => window.open(ORCHHA_MAP, "_blank")}>
            the nicest and best
          </span>{" "}
          presentation about M.P historical monuments and sights such as Mandu,
          Orchha, Vidisha and Bandhawgarh.
        </>
      ),
      rating: 5,
      avatar: "📚",
      location: "Orchha",
    },
  ];

  // Reviews carousel auto-scroll (left to right)
  useEffect(() => {
    const container = reviewsScrollContainerRef.current;
    if (!container) return;

    const scrollSpeed = 1;
    let animationFrameId: number;

    const scrollReviews = () => {
      if (isReviewsScrolling) {
        container.scrollLeft += scrollSpeed;
        if (
          container.scrollLeft >=
          container.scrollWidth - container.clientWidth
        ) {
          container.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(scrollReviews);
    };

    animationFrameId = requestAnimationFrame(scrollReviews);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isReviewsScrolling]);

  const toggleMute = () => {
    const iframe = videoIframeRef.current;
    if (iframe) {
      const method = isMuted ? "unmute" : "mute";
      iframe.contentWindow?.postMessage({ method }, "*");
      setIsMuted(!isMuted);
    }
  };

  const renderReviewCard = (testimonial: Review, key: string) => (
    <div
      key={key}
      className="flex-shrink-0 w-72 sm:w-80 bg-[#595959]/90 rounded-2xl p-4 sm:p-6 border border-white/10 shadow-lg hover:border-cyan-400/30 transition-all duration-300"
    >
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full bg-cyan-400/20 flex items-center justify-center text-xl mr-3">
          {testimonial.avatar}
        </div>
        <div className="flex-1">
          <h4 className="text-white font-semibold text-sm">{testimonial.name}</h4>
          <div className="flex items-center mt-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-400/30 backdrop-blur-sm">
              {testimonial.location}
            </span>
          </div>
        </div>
      </div>
      <div className="flex mb-4 justify-center">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
        ))}
      </div>
      <p className="text-white/90 text-sm leading-relaxed">{testimonial.text}</p>
    </div>
  );

  return (
    <div className="bg-black min-h-screen">
      {/* Video Section with Overlays */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        {/* Logo - Top Left */}
        <motion.div
          className="absolute top-6 left-6 z-[100]"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <a href="#uncle-sam">
            <img
              src="/Aankhin Dekha Logo.png"
              alt="Aankhin Dekha Logo"
              className="h-12 sm:h-16 object-contain drop-shadow-lg"
            />
          </a>
        </motion.div>

        {/* Book Now - Top Right */}
        <motion.div
          className="absolute top-6 right-6 z-[100] cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          onClick={() => router.push("/location")}
        >
          <img
            src="/book_now.png"
            alt="Book Now"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-lg hover:brightness-110 transition-all duration-300"
          />
        </motion.div>

        <div className="relative">
          <iframe
            ref={videoIframeRef}
            src={`https://player.cloudinary.com/embed/?cloud_name=drmhkpy6o&public_id=Aankhon_Dekha_Compressed_Updated_sgrhzj&profile=cld-adaptive-stream&autoplay=true&muted=${isMuted}&controls=false&loop=true`}
            width="640"
            height="360"
            style={{ height: "auto", width: "100%", aspectRatio: "640 / 360" }}
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowFullScreen
            loading="lazy"
            key={isMuted ? "muted" : "unmuted"}
          />
          <button
            onClick={toggleMute}
            className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 z-10"
            aria-label={isMuted ? "Unmute video" : "Mute video"}
          >
            {isMuted ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            )}
          </button>
        </div>
      </motion.div>

      {/* Hero + Experience Section */}
      <motion.div
        className="relative w-full"
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        viewport={{ once: true }}
      >
        <section id="uncle-sam">
          <motion.div
            className="relative w-full mb-8"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <img
              src="/bg_img.png"
              alt="Background"
              className="w-full h-auto object-contain max-h-screen"
            />

            <motion.div
              className="absolute right-[30%] -bottom-[30%] translate-y-1/2 z-20 hidden sm:block"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <motion.img
                src="/uncle-sam-character.png"
                alt="Aankhon Dekha Character"
                className="max-h-[100px] sm:max-h-[180px] md:max-h-[240px] lg:max-h-[300px] object-contain drop-shadow-[0_0_25px_#00ccff]"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          </motion.div>
        </section>

        <motion.section
          className="relative bg-[#f4e2c0] text-black py-1 sm:py-3 md:py-5 px-4 sm:px-8 md:px-12 mt-8"
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center text-left">
              <div>
                <h4 className="text-lg md:text-xl font-semibold">Where Heritage</h4>
                <h4 className="text-lg md:text-xl font-semibold">
                  Meets the Future
                </h4>
              </div>
            </div>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-normal mt-4 max-[324px]:text-lg max-[324px]:font-bold">
              Who is Aankhon Dekha ?
            </h1>
            <p className="mt-4 max-w-3xl text-left font-bold text-sm md:text-base">
              Aankhon Dekha – A New Dimension, where Imagination Meets Immersion.
              Step into the extraordinary with Aankhon Dekha, our brand-new VR
              experience centre by TellMe Digiinfotech Pvt Ltd—now live in Bhopal
              and Orchha!
            </p>
            <a
              className="font-black text-[15px] leading-[18px] text-[#99160B] font-aileron"
              href="/about"
            >
              Know More...
            </a>
          </div>
        </motion.section>
      </motion.div>

      <AttractionsSection />

      {/* Our Centers Section */}
      <motion.section
        className="bg-black text-white py-16 px-4 sm:px-8 md:px-12"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Our Centers
            </h2>
          </div>

          {/* BHOPAL */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">BHOPAL</h3>
              <h4 className="text-xl font-semibold mb-4">
                Immersion at the State Museum
              </h4>
              <p className="text-gray-300 leading-relaxed">
                Located within the State Museum, Bhopal — an architectural gem
                filled with immersive VR exhibitions and stories from Madhya
                Pradesh&apos;s rich heritage.
              </p>
              <button
                className="bg-gradient-to-r from-[#99160B] to-[#B91C1C] hover:from-[#B91C1C] hover:to-[#99160B] text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl"
                onClick={() => router.push("/location")}
              >
                Visit Bhopal Center
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <motion.img src="/bhopal/1.png" alt="Bhopal" loading="lazy" className="rounded-lg shadow-lg w-full h-48 object-cover" animate={{ x: [0, -10, 10, 0], y: [0, -5, 5, 0], rotate: [0, -2, 2, 0] }} transition={{ duration: 6, repeat: Infinity }} />
              <motion.img src="/bhopal/3.png" alt="Bhopal" loading="lazy" className="rounded-lg shadow-lg w-full h-48 object-cover mt-8" animate={{ x: [0, 8, -8, 0], y: [0, -3, 3, 0], rotate: [0, 1, -1, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 0.5 }} />
              <motion.img src="/bhopal/4.png" alt="Bhopal" loading="lazy" className="rounded-lg shadow-lg w-full h-48 object-cover" animate={{ x: [0, -6, 6, 0], y: [0, 4, -4, 0], rotate: [0, -1, 1, 0] }} transition={{ duration: 7, repeat: Infinity, delay: 1 }} />
              <motion.img src="/bhopal/5.png" alt="Bhopal" loading="lazy" className="rounded-lg shadow-lg w-full h-48 object-cover mt-8" animate={{ x: [0, 12, -12, 0], y: [0, -6, 6, 0], rotate: [0, 3, -3, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 1.5 }} />
            </div>
          </div>

          {/* ORCHHA */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="grid grid-cols-2 gap-4 order-2 lg:order-1">
              <motion.img src="/orchha/orchha (1).jpg" alt="Orchha" loading="lazy" className="rounded-lg shadow-lg w-full h-48 object-cover" animate={{ x: [0, -8, 8, 0], y: [0, 5, -5, 0], rotate: [0, -2, 2, 0] }} transition={{ duration: 6, repeat: Infinity }} />
              <div />
              <div />
              <motion.img src="/orchha/orchha (2).jpg" alt="Orchha" loading="lazy" className="rounded-lg shadow-lg w-full h-48 object-cover" animate={{ x: [0, 10, -10, 0], y: [0, -4, 4, 0], rotate: [0, 1, -1, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 0.5 }} />
            </div>

            <div className="space-y-6 order-1 lg:order-2">
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">ORCHHA</h3>
              <h4 className="text-xl font-semibold mb-4">
                Walking Through Timeless Heritage
              </h4>
              <p className="text-gray-300 leading-relaxed">
                Experience Raja Mahal like never before with 8K 360° VR films that
                let you walk through ancient palaces, temples, and royal stories.
              </p>
              <button
                className="bg-gradient-to-r from-[#99160B] to-[#B91C1C] text-white font-semibold py-3 px-6 rounded-lg shadow-lg"
                onClick={() => router.push("/location")}
              >
                Visit Orchha Center
              </button>
            </div>
          </div>

          {/* MPT BOAT CLUB */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">MPT BOAT CLUB</h3>
              <h4 className="text-xl font-semibold mb-4">Adventure on the Water</h4>
              <p className="text-gray-300 leading-relaxed">
                At MPT Boat Club, enjoy VR experiences that recreate thrilling
                water sports, jet skiing, and underwater exploration — all in
                breathtaking detail.
              </p>
              <button
                className="bg-gradient-to-r from-[#99160B] to-[#B91C1C] text-white font-semibold py-3 px-6 rounded-lg shadow-lg"
                onClick={() => router.push("/location")}
              >
                Visit Boat Club Center
              </button>
            </div>

            <div className="grid grid-cols-2 gap-10">
              <motion.img src="/boat club/boat club.jpeg" alt="Boat Club" loading="lazy" className="rounded-lg shadow-lg w-full h-48 object-cover" animate={{ x: [0, -10, 10, 0], y: [0, -5, 5, 0], rotate: [0, -2, 2, 0] }} transition={{ duration: 6, repeat: Infinity }} />
              <motion.img src="/boat club/boat club1.jpeg" alt="Boat Club VR" loading="lazy" className="rounded-lg shadow-lg w-full h-48 object-cover mt-8" animate={{ x: [0, 8, -8, 0], y: [0, 4, -4, 0], rotate: [0, 1, -1, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 0.5 }} />
            </div>
          </div>

          {/* MAHESHWAR */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="grid grid-cols-2 gap-4 order-2 lg:order-1">
              <motion.img src="/maheshwar/maheshwar.jpeg" alt="Maheshwar" loading="lazy" className="rounded-lg shadow-lg w-full h-48 object-cover" animate={{ x: [0, -8, 8, 0], y: [0, 5, -5, 0], rotate: [0, -2, 2, 0] }} transition={{ duration: 6, repeat: Infinity }} />
              <div />
              <div />
              <motion.img src="/maheshwar/maheshwar1.jpeg" alt="Maheshwar" loading="lazy" className="rounded-lg shadow-lg w-full h-48 object-cover" animate={{ x: [0, 10, -10, 0], y: [0, -4, 4, 0], rotate: [0, 1, -1, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 0.5 }} />
            </div>

            <div className="space-y-6 order-1 lg:order-2">
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">MAHESHWAR</h3>
              <h4 className="text-xl font-semibold mb-4">
                Where Spirituality Meets Technology
              </h4>
              <p className="text-gray-300 leading-relaxed">
                Explore Maheshwar&apos;s serene ghats and historic temples through
                immersive VR storytelling that brings the sacred Narmada
                riverfront to life.
              </p>
              <button
                className="bg-gradient-to-r from-[#99160B] to-[#B91C1C] text-white font-semibold py-3 px-6 rounded-lg shadow-lg"
                onClick={() => router.push("/location")}
              >
                Visit Maheshwar Center
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      <Testimonial />

      {/* Google Reviews Carousel */}
      <motion.div
        className="mb-4 sm:mb-8 relative"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.4 }}
        viewport={{ once: true }}
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-1">
          Google Reviews
        </h2>
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-4 sm:mb-8">
          from our Visitors
          <span className="block w-16 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto mt-2 rounded-full" />
        </h2>
        <div
          ref={reviewsScrollContainerRef}
          className="flex overflow-x-auto pb-8 -mx-4 hide-scrollbar"
          onMouseEnter={() => setIsReviewsScrolling(false)}
          onMouseLeave={() => setIsReviewsScrolling(true)}
          onTouchStart={() => setIsReviewsScrolling(false)}
          onTouchEnd={() => setTimeout(() => setIsReviewsScrolling(true), 2000)}
        >
          <div className="flex space-x-6 px-4">
            {testimonials.map((t, i) => renderReviewCard(t, `${t.name}-${i}`))}
            {testimonials.map((t, i) => renderReviewCard(t, `dup-${t.name}-${i}`))}
          </div>
        </div>
      </motion.div>

      {/* Bottom Video */}
      <motion.div
        className="w-full aspect-[2.6]"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        viewport={{ once: true }}
      >
        <LazyVideo
          src="/vid/bootom_video_just_above_footer.mp4"
          className="w-full h-full cursor-pointer"
          autoPlay
          loop
          muted
          controls={false}
          onClick={() => router.push("/location")}
        />
      </motion.div>

      <Footer />
    </div>
  );
};

export default HomeClient;
