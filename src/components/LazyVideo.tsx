"use client";

import { useEffect, useRef, useState, type VideoHTMLAttributes } from "react";
import { media } from "@/lib/media";

interface LazyVideoProps extends VideoHTMLAttributes<HTMLVideoElement> {
  /** /public path or URL — resolved through media() (Firebase Storage). */
  src: string;
}

/**
 * A <video> that only downloads when scrolled near the viewport and pauses
 * when it leaves. Keeps initial page load light when many videos are present
 * (e.g. the testimonial carousel). `preload="none"` until in view.
 */
export default function LazyVideo({ src, ...rest }: LazyVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "300px", threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (inView) {
      setLoad(true); // once loaded, keep the source to avoid re-fetching
      el.play?.().catch(() => {});
    } else {
      el.pause?.();
    }
  }, [inView]);

  return (
    <video ref={ref} src={load ? media(src) : undefined} preload="none" {...rest} />
  );
}
