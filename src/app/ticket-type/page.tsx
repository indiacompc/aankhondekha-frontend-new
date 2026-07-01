"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Ticket as TicketIcon } from "lucide-react";
import { toast } from "sonner";
import { getTicketTypes } from "@/lib/db";
import { withGst } from "@/lib/booking";
import type { TicketType } from "@/lib/types";
import { useBooking } from "@/components/BookingProvider";
import { useCustomer } from "@/components/CustomerProvider";

export default function TicketTypePage() {
  const router = useRouter();
  const { event, setTicketType } = useBooking();
  const { customer } = useCustomer();
  const [types, setTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!event) {
      router.replace("/location");
      return;
    }
    if (!customer) {
      router.replace("/register");
      return;
    }
    getTicketTypes(event.eventId)
      .then(setTypes)
      .catch(() => toast.error("Could not load ticket types"))
      .finally(() => setLoading(false));
  }, [event, customer, router]);

  const choose = (t: TicketType) => {
    setTicketType(t);
    router.push("/quantity");
  };

  if (!event) return null;

  return (
    <div className="min-h-screen bg-[#121212] p-6">
      <div className="max-w-md mx-auto">
        <div className="mb-2 flex items-center">
          <button
            onClick={() => router.push("/location")}
            className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-md"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="ml-5 font-bold text-[24px] text-white">Select Ticket</h1>
        </div>
        <p className="text-white/60 text-sm mb-6 ml-[60px]">{event.location}</p>

        {loading ? (
          <p className="text-white/70">Loading ticket types…</p>
        ) : types.length === 0 ? (
          <p className="text-white/70">No ticket types for this location yet.</p>
        ) : (
          <div className="space-y-4">
            {types.map((t, i) => (
              <motion.button
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                onClick={() => choose(t)}
                className="w-full text-left bg-[#595959] hover:bg-[#666] text-white rounded-xl p-5 shadow-lg transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <TicketIcon className="w-5 h-5 text-[#96FF00]" />
                    <span className="text-lg font-semibold">{t.typeName}</span>
                  </div>
                  <div className="text-right">
                    {t.originalPrice && t.originalPrice > withGst(t.price) && (
                      <span className="text-red-400 line-through text-sm mr-1">
                        ₹{t.originalPrice.toFixed(2)}
                      </span>
                    )}
                    <span className="text-[#96FF00] font-bold text-lg">
                      ₹{withGst(t.price).toFixed(2)}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-white/60 text-right -mt-1">
                  Price includes 18% GST
                </p>
                {t.originalPrice && t.originalPrice > withGst(t.price) && (
                  <p className="text-yellow-300 text-xs font-medium text-right">
                    Save ₹{(t.originalPrice - withGst(t.price)).toFixed(2)}!
                  </p>
                )}
                {t.description && (
                  <p className="text-white/80 text-sm mt-2">{t.description}</p>
                )}
                <div className="flex items-center gap-3 mt-3 text-xs text-white/70">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {t.durationMinutes} min
                  </span>
                  {t.offer && (
                    <span className="px-2 py-0.5 rounded-full bg-[#96FF00]/15 text-[#96FF00]">
                      {t.offer}
                    </span>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
