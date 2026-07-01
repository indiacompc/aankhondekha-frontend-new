"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Minus, Plus, Gift } from "lucide-react";
import { useBooking } from "@/components/BookingProvider";
import {
  complimentaryFor,
  hasTourGuide as computeTourGuide,
  maxQuantityFor,
  totalFor,
} from "@/lib/booking";

export default function QuantityPage() {
  const router = useRouter();
  const {
    event,
    ticketType,
    quantity,
    setQuantity,
    setComplimentaryTickets,
    setHasTourGuide,
  } = useBooking();

  useEffect(() => {
    if (!event || !ticketType) router.replace("/location");
  }, [event, ticketType, router]);

  if (!event || !ticketType) return null;

  const max = maxQuantityFor(event.eventId);
  const comp = complimentaryFor(quantity);
  const tourGuide = computeTourGuide(event.eventId, quantity);
  const total = totalFor(ticketType.price, quantity);

  const change = (delta: number) => {
    const next = Math.min(max, Math.max(1, quantity + delta));
    setQuantity(next);
  };

  const proceed = () => {
    setComplimentaryTickets(comp);
    setHasTourGuide(tourGuide);
    router.push("/date-selection");
  };

  return (
    <div className="min-h-screen bg-[#121212] p-6">
      <div className="max-w-md mx-auto">
        <div className="mb-6 flex items-center">
          <button
            onClick={() => router.push("/ticket-type")}
            className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-md"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="ml-5 font-bold text-[24px] text-white">Quantity</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#595959] rounded-xl p-6 shadow-lg text-white space-y-6"
        >
          <div>
            <p className="font-semibold">{ticketType.typeName}</p>
            <p className="text-white/70 text-sm">
              {event.location} · ₹{ticketType.price.toFixed(2)} each (incl. GST)
            </p>
          </div>

          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => change(-1)}
              className="w-12 h-12 rounded-full bg-[#99160B] flex items-center justify-center disabled:opacity-40"
              disabled={quantity <= 1}
              aria-label="Decrease"
            >
              <Minus className="w-5 h-5" />
            </button>
            <span className="text-3xl font-bold w-12 text-center">{quantity}</span>
            <button
              onClick={() => change(1)}
              className="w-12 h-12 rounded-full bg-[#99160B] flex items-center justify-center disabled:opacity-40"
              disabled={quantity >= max}
              aria-label="Increase"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <p className="text-center text-xs text-white/50">Max {max} per booking</p>

          {comp > 0 && (
            <div className="flex items-center gap-2 text-[#96FF00] text-sm">
              <Gift className="w-4 h-4" />
              {comp} complimentary ticket{comp > 1 ? "s" : ""} (Buy 4 Get 1 Free)
            </div>
          )}
          {tourGuide && (
            <div className="text-sm text-[#96FF00]">
              + Free 30-min tour guide included
            </div>
          )}

          <div className="border-t border-white/15 pt-4 flex justify-between">
            <span className="text-white/80">Total ({quantity} paid, incl. GST)</span>
            <span className="font-bold text-lg">₹{total}</span>
          </div>

          <button
            onClick={proceed}
            className="w-full py-3 rounded-xl bg-[#99160B] text-white font-medium"
          >
            Continue
          </button>
        </motion.div>
      </div>
    </div>
  );
}
