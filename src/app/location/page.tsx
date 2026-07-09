"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, Check } from "lucide-react";
import { toast } from "sonner";
import { getEvents } from "@/lib/db";
import type { EventDoc } from "@/lib/types";
import { useBooking } from "@/components/BookingProvider";
import { useCustomer } from "@/components/CustomerProvider";
import { useAuth } from "@/components/AuthProvider";
import BackButton from "@/components/BackButton";

export default function LocationSelection() {
  const router = useRouter();
  const { event, setEvent } = useBooking();
  const { customer } = useCustomer();
  const { admin } = useAuth();
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEvents()
      .then(setEvents)
      .catch(() => toast.error("Could not load locations"))
      .finally(() => setLoading(false));
  }, []);

  // A Reception Admin is tied to a single location; Ops/Super Admins and
  // customers may pick any.
  const restrictedEventId =
    admin?.role === "Reception Admin" && admin.eventId ? admin.eventId : null;

  const visibleEvents = restrictedEventId
    ? events.filter((e) => e.eventId === restrictedEventId)
    : events;

  // Auto-select the only allowed location (also clears a stale selection that
  // belongs to a different location).
  useEffect(() => {
    if (!restrictedEventId || visibleEvents.length !== 1) return;
    if (event?.eventId !== restrictedEventId) setEvent(visibleEvents[0]);
  }, [restrictedEventId, visibleEvents, event, setEvent]);

  const selectEvent = (e: EventDoc) => {
    if (restrictedEventId && e.eventId !== restrictedEventId) {
      toast.error("You don't have rights to select this location");
      return;
    }
    setEvent(e);
  };

  const handleContinue = () => {
    if (!event) {
      toast.error("Please select a location to continue");
      return;
    }
    if (restrictedEventId && event.eventId !== restrictedEventId) {
      toast.error("You don't have rights to select this location");
      return;
    }
    router.push(customer ? "/ticket-type" : "/register");
  };

  return (
    <div className="min-h-screen bg-[#121212] p-6">
      <div className="max-w-md mx-auto">
        <div className="mb-6 flex items-center">
          <BackButton />
          <h1 className="ml-5 font-aileron font-bold text-[24px] text-white">
            Select Location
          </h1>
        </div>

        {loading ? (
          <p className="text-white/70">Loading locations…</p>
        ) : visibleEvents.length === 0 ? (
          <p className="text-white/70">
            {restrictedEventId
              ? "No location is assigned to your account. Please contact a Super Admin."
              : "No locations available."}
          </p>
        ) : (
          <div className="space-y-4">
            {visibleEvents.map((e, i) => {
              const selected = event?.eventId === e.eventId;
              return (
                <motion.button
                  key={e.eventId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  onClick={() => selectEvent(e)}
                  className={`w-full flex items-center gap-4 rounded-xl p-4 shadow-lg transition-all text-left ${
                    selected
                      ? "bg-[#595959] border-2 border-[#96FF00]"
                      : "bg-[#595959] hover:bg-[#666] border-2 border-transparent"
                  }`}
                >
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-black text-white flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </span>
                  <span className="text-lg text-white flex-1">{e.location}</span>
                  {selected && (
                    <span className="w-6 h-6 rounded-full bg-[#96FF00] flex items-center justify-center">
                      <Check className="w-4 h-4 text-black" />
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}

        <p className="text-center text-white text-sm mt-8 mb-4">
          🎉 Offer 35% Discount valid until 31st July!
        </p>

        <motion.button
          onClick={handleContinue}
          disabled={!event}
          whileTap={{ scale: event ? 0.98 : 1 }}
          className={`w-full py-3 rounded-lg bg-[#99160B] text-white font-medium ${
            !event ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Continue
        </motion.button>
      </div>
    </div>
  );
}
