"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Ticket as TicketIcon, Gift } from "lucide-react";
import { toast } from "sonner";
import { getTicketTypes } from "@/lib/db";
import type { TicketType } from "@/lib/types";
import { useBooking } from "@/components/BookingProvider";
import { useCustomer } from "@/components/CustomerProvider";
import BackButton from "@/components/BackButton";

export default function TicketTypePage() {
  const router = useRouter();
  const { event, ticketType, setTicketType, isGift, setIsGift } = useBooking();
  const { customer } = useCustomer();
  const [types, setTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState<TicketType | null>(null);

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
      .then((fresh) => {
        setTypes(fresh);
        // Reconcile any previously-selected ticket (from localStorage) with
        // fresh Firestore data so a stale cached price can't linger.
        if (ticketType) {
          const match = fresh.find((t) => t.id === ticketType.id);
          if (match) setTicketType(match);
          else setTicketType(null);
        }
      })
      .catch(() => toast.error("Could not load ticket types"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, customer, router]);

  const handleContinue = () => {
    if (!ticketType) {
      toast.error("Please select a ticket type to continue");
      return;
    }
    router.push("/quantity");
  };

  if (!event) return null;

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col px-4 py-6">
      <div className="mb-4 flex items-center">
        <BackButton />
        <h1 className="ml-5 font-aileron font-bold text-[24px] text-white">
          Select Ticket Type
        </h1>
      </div>

      <div className="w-full rounded-full bg-[#99160B] text-sm text-white px-4 py-1.5 mb-6">
        Choose your preferred ticket option
      </div>

      {/* Ticket types */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-gray-400">Loading ticket types…</p>
        ) : types.length === 0 ? (
          <p className="text-white/70">No ticket types for this location yet.</p>
        ) : (
          types.map((t, i) => {
            const selected = ticketType?.id === t.id;
            const price = t.price;
            const hasDiscount = !!t.originalPrice && t.originalPrice > price;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                onClick={() => setTicketType(t)}
                className={`cursor-pointer rounded-2xl p-5 transition-all duration-300 ${
                  selected
                    ? "bg-[#595959] border-2 border-[#96FF00]"
                    : "bg-[#2C410E] hover:bg-[#365214] border-2 border-transparent"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#D9D9D9] flex items-center justify-center flex-shrink-0 mt-1">
                    <TicketIcon className="h-6 w-6 text-black" />
                  </div>

                  <div className="flex flex-col w-full">
                    <div className="flex justify-between items-center w-full flex-wrap">
                      <h3 className="text-white font-semibold text-lg">
                        {t.typeName}
                      </h3>
                      <button
                        className="text-sm text-[#96FF00] underline hover:text-[#78CC00]"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPopup(t);
                        }}
                      >
                        Know More
                      </button>
                    </div>

                    <p className="text-white text-sm mt-1">
                      {t.durationMinutes} mins{t.description ? ` ${t.description}` : ""}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      {hasDiscount && (
                        <p className="text-red-400 line-through text-sm">
                          ₹{t.originalPrice!.toFixed(2)}
                        </p>
                      )}
                      <p className="text-[#96FF00] font-semibold text-lg">
                        ₹{price.toFixed(2)}
                        <span className="text-xs text-white ml-1">
                          (Price includes 18% GST)
                        </span>
                      </p>
                      {hasDiscount && (
                        <p className="text-yellow-300 text-sm font-medium">
                          Save ₹{(t.originalPrice! - price).toFixed(2)}!
                        </p>
                      )}
                    </div>

                    {t.offer && (
                      <p className="text-white text-lg font-medium mt-1">
                        {t.offer}
                      </p>
                    )}
                    {t.note && (
                      <p className="text-[#96FF00] text-lg mt-2">{t.note}</p>
                    )}
                    {t.note3 && (
                      <p className="text-white/80 text-sm mt-2">{t.note3}</p>
                    )}
                  </div>

                  {selected && (
                    <div className="w-6 h-6 rounded-full bg-[#96FF00] flex items-center justify-center self-start flex-shrink-0">
                      <Check className="h-4 w-4 text-black" />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Gift a Ticket */}
      <div
        onClick={() => setIsGift(!isGift)}
        className={`cursor-pointer rounded-2xl p-5 mt-4 transition-all duration-300 ${
          isGift
            ? "bg-[#595959] border-2 border-[#96FF00]"
            : "bg-[#2C410E] hover:bg-[#365214] border-2 border-transparent"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-[#D9D9D9] flex items-center justify-center mr-4">
              <Gift className="h-6 w-6 text-black" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Gift a Ticket</h3>
              <p className="text-white text-sm">Valid for 3 months from purchase</p>
            </div>
          </div>
          <div
            className={`w-11 h-6 rounded-full relative transition ${
              isGift ? "bg-[#96FF00]" : "bg-gray-600"
            }`}
          >
            <div
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                isGift ? "translate-x-5" : ""
              }`}
            />
          </div>
        </div>
      </div>

      {/* Continue */}
      <motion.button
        onClick={handleContinue}
        disabled={!ticketType}
        whileTap={{ scale: ticketType ? 0.98 : 1 }}
        className={`mt-8 mb-4 w-full py-3 rounded-lg bg-[#99160B] text-white font-medium ${
          !ticketType ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        Continue
      </motion.button>

      <p className="text-center text-sm text-white">
        Once a booking is confirmed, it is non-refundable, non-cancellable, and
        cannot be postponed under any circumstances.
      </p>

      {/* Know More popup */}
      {popup && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4"
          onClick={() => setPopup(null)}
        >
          <div
            className="bg-[#1E1E1E] p-6 rounded-lg w-80 text-white shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold">{popup.typeName}</h2>
            <p className="text-sm mt-2">{popup.durationMinutes} mins experience</p>
            {popup.note1 && (
              <p className="text-white font-aileron mt-2">{popup.note1}</p>
            )}
            {popup.note2 && (
              <p className="text-white font-aileron mt-2">{popup.note2}</p>
            )}
            {popup.description && !popup.note1 && !popup.note2 && (
              <p className="text-white font-aileron mt-2">{popup.description}</p>
            )}
            <button
              className="mt-4 bg-[#99160B] text-white py-2 px-4 rounded-lg w-full"
              onClick={() => setPopup(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
