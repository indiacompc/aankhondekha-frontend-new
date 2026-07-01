"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";

interface Attraction {
  image: string;
  title: string;
  description: string;
  location: string;
}

const attractionsData: Attraction[] = [
  {
    image: "/1.png",
    title: "3D Illusion art",
    description:
      "Hyper-realistic 3D street art creates a living history effect. Optical illusions make heritage sites feel tangible.",
    location: "bhopal",
  },
  {
    image: "/2.png",
    title: "VR Room",
    description:
      "Dive into history with VR & AR, and be transported into a narrative journey through historical palaces — all in stereoscopic 3D.",
    location: "bhopal",
  },
  {
    image: "/3.png",
    title: "16 Frames of Time",
    description:
      "Rotate puzzle cubes to reveal key moments from Bhopal's and Madhya Pradesh past to present. Enjoy unveiled photography.",
    location: "bhopal",
  },
  {
    image: "/4.png",
    title: "Sand Art Room",
    description:
      "The Sand Art Room lets you walk a riverbank, create art, and share stories—surrounded by cool air and dawn-like light.",
    location: "bhopal",
  },
  {
    image: "/5.png",
    title: "The Dark Room",
    description:
      "Experience stories through shadows, sound, and projection in a moody, low-lit space that leaves a lasting impact.",
    location: "bhopal",
  },
  {
    image: "/Gwalior Fort Logo1.png",
    title: "VR Game",
    description:
      "Immerse yourself in a virtual world with our VR Game, where history and technology collide for an unforgettable experience.",
    location: "bhopal",
  },
];

const texts = [
  "From illusionary art to 360° VR, experience it all in one place.",
  "From photo journeys to sand play, experience imagination come alive.",
  "Discover hidden stories and heritage beautifully unveiled.",
];

/** Hook: track viewport width, SSR-safe (defaults to desktop until mounted). */
function useScreenWidth() {
  const [screenWidth, setScreenWidth] = useState(1280);
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return screenWidth;
}

const Card = ({ attraction }: { attraction: Attraction }) => (
  <>
    <div className="relative h-full w-full -translate-y-24 flex items-center justify-center bg-white transition-transform duration-500 ease-in-out">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={attraction.image}
        alt={attraction.title}
        className="max-h-full max-w-full object-contain rounded-t-2xl transition-all duration-500"
      />
    </div>
  </>
);

/** One row of two cards that swing apart when scrolled into view. */
const AttractionPair = ({
  pair,
  pairIndex,
  screenWidth,
}: {
  pair: Attraction[];
  pairIndex: number;
  screenWidth: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref);

  const offset =
    screenWidth < 500
      ? 10
      : screenWidth < 768
        ? 25
        : screenWidth < 1024
          ? 100
          : 200;
  const rotate = screenWidth < 450 ? 0 : screenWidth < 500 ? 5 : 10;

  return (
    <div
      ref={ref}
      className="relative h-[350px] flex justify-center items-center mb-8"
    >
      {pair.map((attraction, i) => (
        <motion.div
          key={attraction.title}
          animate={
            isInView
              ? {
                  x: i === 0 ? -offset : offset,
                  rotate: i === 0 ? -rotate : rotate,
                }
              : { x: 0, rotate: 0 }
          }
          transition={{ duration: 0.5, delay: pairIndex * 0.3 }}
          className="absolute left-0 right-0 mx-auto group h-[350px] w-full max-w-[271px] cursor-pointer overflow-hidden rounded-2xl transition-all duration-500 hover:scale-105 z-10"
        >
          <Card attraction={attraction} />
          <div
            className={`absolute right-0 bottom-0 left-0 transform bg-white px-5 py-5 transition-transform duration-500 ease-in-out ${
              isInView ? "translate-y-0" : "translate-y-full"
            }`}
          >
            <h2 className="mb-3 text-base leading-tight font-semibold text-black">
              {attraction.title}
            </h2>
            <p className="text-sm leading-relaxed font-medium text-black">
              {attraction.description}
            </p>
          </div>
        </motion.div>
      ))}

      <motion.div
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1, delay: pairIndex * 0.3 + 0.7 }}
        className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-lg text-center max-w-xs z-0"
      >
        {texts[pairIndex]}
      </motion.div>
    </div>
  );
};

const AttractionsSection = () => {
  const screenWidth = useScreenWidth();

  const bhopalAttractions = attractionsData.filter(
    (a) => a.location === "bhopal" || a.location === "both",
  );

  const pairs: Attraction[][] = [];
  for (let i = 0; i < bhopalAttractions.length; i += 2) {
    pairs.push(bhopalAttractions.slice(i, i + 2));
  }

  return (
    <section className="bg-black text-white py-16 px-0">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-center">
            Explore Aankhon
            <br />
            Dekha Attractions
          </h2>
        </div>

        <div className="flex flex-col gap-8">
          {pairs.map((pair, pairIndex) => (
            <AttractionPair
              key={pairIndex}
              pair={pair}
              pairIndex={pairIndex}
              screenWidth={screenWidth}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AttractionsSection;
