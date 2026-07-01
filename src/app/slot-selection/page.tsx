"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { Clock, Check } from "lucide-react";
import { toast } from "sonner";
import BackButton from "@/components/BackButton";
import GlassCard from "@/components/GlassCard";
import PageTransition from "@/components/PageTransition";
import { getSlots } from "@/lib/db";
import type { Slot } from "@/lib/types";
import { useBooking } from "@/components/BookingProvider";

export default function SlotSelection() {
  const router = useRouter();
  const { event, ticketType, date, quantity, complimentaryTickets, slot, setSlot } =
    useBooking();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(slot?.id ?? null);

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

  const handleContinue = () => {
    const chosen = slots.find((s) => s.id === selectedId);
    if (!chosen) return;
    if (chosen.availableSeats < needed) {
      toast.error(`Only ${chosen.availableSeats} seats left in this slot`);
      return;
    }
    setSlot(chosen);
    router.push("/payment");
  };

  if (!event || !date) return null;

  return (
    <PageTransition>
      <div className="bg-[#121212] min-h-screen flex flex-col px-4 py-6 pb-24">
        <div className="mb-6 flex items-center">
          <BackButton />
          <h1 className="font-aileron ml-5 font-bold text-[24px] leading-[110%] text-white">
            Select Time Slot
          </h1>
        </div>

        <div className="inline-flex items-center w-fit px-3 py-1 rounded-full bg-[#99160B] text-sm text-white mb-6">
          <Clock className="h-5 w-5 mr-1" />
          <span>Choose your preferred time</span>
        </div>

        <div className="mb-6">
          <h2 className="text-lg text-white ml-5 font-medium mb-2">
            {format(parseISO(date), "EEEE, MMMM d, yyyy")}
          </h2>
          <p className="text-sm text-white/70 ml-5">
            Please select an available time slot
          </p>
        </div>

        {loading ? (
          <p className="text-center text-gray-400">Loading slots…</p>
        ) : slots.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 mb-8">
            {slots.map((s, index) => {
              const selected = selectedId === s.id;
              return (
                <GlassCard
                  key={s.id}
                  delay={index}
                  className={`cursor-pointer transition-all duration-300 ${
                    selected ? "border-[#96FF00] border-2" : "hover:bg-[#2C410E]"
                  }`}
                  onClick={() => setSelectedId(s.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-lg text-white">{s.slotTime}</span>
                      <span className="text-sm text-white">
                        {s.availableSeats} seats left
                      </span>
                    </div>
                    {selected && (
                      <div className="w-6 h-6 rounded-full bg-[#96FF00] flex items-center justify-center">
                        <Check className="h-4 w-4 text-black" />
                      </div>
                    )}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        ) : (
          <GlassCard className="mb-8 text-center py-8">
            <h3 className="text-lg font-medium mb-4 text-white">
              No Available Slots
            </h3>
            <p className="text-white/70 mb-6">
              Sorry, all slots for this date are fully booked.
            </p>
            <button
              onClick={() => router.push("/date-selection")}
              className="inline-flex py-2 px-5 rounded-lg bg-[#99160B] text-white"
            >
              Select Another Date
            </button>
          </GlassCard>
        )}

        <motion.button
          onClick={handleContinue}
          disabled={!selectedId}
          className={`fixed bottom-0 left-0 right-0 py-4 bg-[#99160B] text-white font-medium ${
            !selectedId ? "opacity-50 cursor-not-allowed" : ""
          }`}
          whileTap={{ scale: selectedId ? 0.98 : 1 }}
        >
          Continue to Payment
        </motion.button>
      </div>
    </PageTransition>
  );
}
