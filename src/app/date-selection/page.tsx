"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useBooking } from "@/components/BookingProvider";

export default function DateSelection() {
  const router = useRouter();
  const { event, ticketType, date, setDate } = useBooking();

  useEffect(() => {
    if (!event || !ticketType) router.replace("/location");
  }, [event, ticketType, router]);

  // Next 14 days (slots are seeded for this window).
  const days = useMemo(() => {
    const out: { iso: string; label: string; sub: string }[] = [];
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    for (let i = 0; i < 14; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      out.push({
        iso: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" }),
        sub: d.toLocaleDateString("en-US", { month: "short" }),
      });
    }
    return out;
  }, []);

  const choose = (iso: string) => {
    setDate(iso);
    router.push("/slot-selection");
  };

  if (!event || !ticketType) return null;

  return (
    <div className="min-h-screen bg-[#121212] p-6">
      <div className="max-w-md mx-auto">
        <div className="mb-6 flex items-center">
          <button
            onClick={() => router.push("/quantity")}
            className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-md"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="ml-5 font-bold text-[24px] text-white">Select Date</h1>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {days.map((d, i) => (
            <motion.button
              key={d.iso}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: i * 0.02 }}
              onClick={() => choose(d.iso)}
              className={`rounded-xl p-4 text-center shadow-lg transition-colors ${
                date === d.iso
                  ? "bg-[#96FF00] text-black"
                  : "bg-[#595959] text-white hover:bg-[#666]"
              }`}
            >
              <div className="text-lg font-bold">{d.label}</div>
              <div className="text-xs opacity-80">{d.sub}</div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
