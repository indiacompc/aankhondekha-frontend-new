"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { getSlots } from "@/lib/db";
import type { Slot } from "@/lib/types";
import { useBooking } from "@/components/BookingProvider";

export default function SlotSelection() {
  const router = useRouter();
  const { event, ticketType, date, quantity, complimentaryTickets, setSlot } =
    useBooking();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  const needed = quantity + complimentaryTickets;

  useEffect(() => {
    if (!event || !ticketType || !date) {
      router.replace("/location");
      return;
    }
    getSlots(event.eventId, date, false)
      .then(setSlots)
      .catch(() => toast.error("Could not load slots"))
      .finally(() => setLoading(false));
  }, [event, ticketType, date, router]);

  const choose = (slot: Slot) => {
    if (slot.availableSeats < needed) {
      toast.error(`Only ${slot.availableSeats} seats left in this slot`);
      return;
    }
    setSlot(slot);
    router.push("/payment");
  };

  if (!event || !date) return null;

  return (
    <div className="min-h-screen bg-[#121212] p-6">
      <div className="max-w-md mx-auto">
        <div className="mb-2 flex items-center">
          <button
            onClick={() => router.push("/date-selection")}
            className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-md"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="ml-5 font-bold text-[24px] text-white">Select Slot</h1>
        </div>
        <p className="text-white/60 text-sm mb-6 ml-[60px]">
          {event.location} ·{" "}
          {new Date(date).toLocaleDateString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>

        {loading ? (
          <p className="text-white/70">Loading slots…</p>
        ) : slots.length === 0 ? (
          <p className="text-white/70">
            No slots available for this date. Try another date.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {slots.map((s, i) => {
              const enough = s.availableSeats >= needed;
              return (
                <motion.button
                  key={s.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.02 }}
                  onClick={() => choose(s)}
                  disabled={!enough}
                  className={`rounded-xl p-3 text-center shadow-lg transition-colors ${
                    enough
                      ? "bg-[#595959] text-white hover:bg-[#666]"
                      : "bg-[#3a3a3a] text-white/40 cursor-not-allowed"
                  }`}
                >
                  <div className="text-sm font-semibold">{s.slotTime}</div>
                  <div className="text-xs mt-1 text-[#96FF00]">
                    {s.availableSeats} seats left
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
