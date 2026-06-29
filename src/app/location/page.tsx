"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { getEvents } from "@/lib/db";
import type { EventDoc } from "@/lib/types";
import { useBooking } from "@/components/BookingProvider";
import { useCustomer } from "@/components/CustomerProvider";

export default function LocationSelection() {
  const router = useRouter();
  const { setEvent } = useBooking();
  const { customer } = useCustomer();
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEvents()
      .then(setEvents)
      .catch(() => toast.error("Could not load locations"))
      .finally(() => setLoading(false));
  }, []);

  const choose = (e: EventDoc) => {
    setEvent(e);
    router.push(customer ? "/ticket-type" : "/register");
  };

  return (
    <div className="min-h-screen bg-[#121212] p-6">
      <div className="max-w-md mx-auto">
        <div className="mb-6 flex items-center">
          <button
            onClick={() => router.push("/")}
            className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-md"
            aria-label="Go home"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="ml-5 font-bold text-[24px] text-white">
            Choose a Location
          </h1>
        </div>

        {loading ? (
          <p className="text-white/70">Loading locations…</p>
        ) : (
          <div className="space-y-3">
            {events.map((e, i) => (
              <motion.button
                key={e.eventId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                onClick={() => choose(e)}
                className="w-full flex items-center gap-4 bg-[#595959] hover:bg-[#666] text-white rounded-xl p-5 shadow-lg transition-colors text-left"
              >
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#96FF00]/10 text-[#96FF00]">
                  <MapPin className="w-6 h-6" />
                </span>
                <span className="text-lg font-semibold">{e.location}</span>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
