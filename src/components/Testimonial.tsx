"use client";

import { useState, useRef, useEffect } from "react";
import { media } from "@/lib/media";

const videos = [
  { id: 1, src: "/videos/Orchha Testimotial 1.mp4" },
  { id: 2, src: "/videos/Orchha Testimonial 11.mp4" },
  { id: 3, src: "/videos/Orchha Testimonial 12.mp4" },
  { id: 4, src: "/videos/Orchha Testimonial 15.mp4" },
  { id: 14, src: "/videos/Orchha testimomnials 4.mp4" },
  { id: 15, src: "/videos/Serior Citizen reel.mp4" },
  { id: 17, src: "/videos/Testimonial 7.mp4" },
  { id: 18, src: "/videos/Testimonial 8.mp4" },
  { id: 19, src: "/videos/Testimonial Orchha Marathi 3.mp4" },
];

const SpeakerIcon = ({ muted }: { muted: boolean }) =>
  muted ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6 text-white"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .89-1.077 1.337-1.707.707L5.586 15z"
        clipRule="evenodd"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
      />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6 text-white"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .89-1.077 1.337-1.707.707L5.586 15z"
      />
    </svg>
  );

const Testimonial = () => {
  const [videoWithAudio, setVideoWithAudio] = useState<number | null>(null);
  const [isScrolling, setIsScrolling] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const scrollSpeed = 1;
    let animationFrameId: number;

    const scroll = () => {
      if (isScrolling) {
        scrollContainer.scrollLeft -= scrollSpeed;
        if (scrollContainer.scrollLeft <= 0) {
          scrollContainer.scrollLeft =
            scrollContainer.scrollWidth - scrollContainer.clientWidth;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isScrolling]);

  const renderCard = (video: { id: number; src: string }, key: string) => (
    <div
      key={key}
      className="relative flex-shrink-0 w-72 sm:w-80 h-[400px] sm:h-[500px] rounded-2xl overflow-hidden shadow-2xl"
      onMouseEnter={() => setIsScrolling(false)}
      onMouseLeave={() => setIsScrolling(true)}
    >
      <div className="relative w-full h-full">
        <video
          src={media(video.src)}
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted={videoWithAudio !== video.id}
          playsInline
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            setVideoWithAudio((prev) => (prev === video.id ? null : video.id));
          }}
          className="absolute bottom-4 right-4 bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors z-10"
          aria-label={videoWithAudio === video.id ? "Mute video" : "Unmute video"}
        >
          <SpeakerIcon muted={videoWithAudio !== video.id} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold text-center text-white mb-8">
        What Our Visitors Say
        <span className="block w-16 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto mt-2 rounded-full" />
      </h2>

      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto pb-8 -mx-4 hide-scrollbar"
      >
        <div className="flex space-x-6 px-4">
          {videos.map((video) => renderCard(video, `v-${video.id}`))}
          {videos.map((video) => renderCard(video, `dup-${video.id}`))}
        </div>
      </div>
    </div>
  );
};

export default Testimonial;
