"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Minus, Plus, Gift, Info } from "lucide-react";
import { toast } from "sonner";
import BackButton from "@/components/BackButton";
import GlassCard from "@/components/GlassCard";
import PageTransition from "@/components/PageTransition";
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
    isGift,
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
  const ticketPrice = ticketType.price;
  const totalPrice = totalFor(ticketPrice, quantity);

  const increment = () => {
    if (quantity >= max) return;
    const next = quantity + 1;
    const newComp = complimentaryFor(next);
    if (newComp > comp) toast.success(`🎉 You got ${newComp - comp} free ticket(s)!`);
    if (event.eventId === "2" && next >= 10 && !tourGuide)
      toast.info("🎉 You unlocked a free 30-minute tour guide!");
    setQuantity(next);
  };

  const decrement = () => {
    if (quantity <= 1) return;
    setQuantity(quantity - 1);
  };

  const handleContinue = () => {
    setComplimentaryTickets(comp);
    setHasTourGuide(tourGuide);
    router.push(isGift ? "/payment" : "/date-selection");
  };

  return (
    <PageTransition>
      <div className="bg-[#121212] min-h-screen flex flex-col px-4 py-6">
        <div className="mb-6 flex items-center">
          <BackButton />
          <h1 className="font-aileron ml-5 font-bold text-[24px] leading-[110%] text-white">
            Select Quantity
          </h1>
        </div>

        <div className="inline-block px-3 py-1 rounded-full bg-[#99160B] text-sm text-white mb-6 w-fit">
          Choose number of tickets required
        </div>

        <GlassCard className="mb-6">
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-medium mb-6 text-white">Number of Tickets</h3>

            <div className="flex items-center justify-center space-x-4 mb-6">
              <button
                onClick={decrement}
                disabled={quantity <= 1}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  quantity <= 1
                    ? "bg-[#595959] text-white/40"
                    : "bg-[#330D0A] text-[#99160B] hover:bg-[#4a1310]"
                }`}
              >
                <Minus className="h-5 w-5" />
              </button>

              <div className="w-16 h-16 font-aileron rounded-full bg-[#595959] text-white flex items-center justify-center text-[32px] font-bold">
                {quantity}
              </div>

              <button
                onClick={increment}
                disabled={quantity >= max}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  quantity >= max
                    ? "bg-[#595959] text-white/40 cursor-not-allowed"
                    : "bg-[#1E3300] text-[#96FF00] hover:bg-[#2a4700]"
                }`}
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            {comp > 0 && (
              <div className="mt-4 flex text-[#96FF00] mb-5 items-center text-lg font-semibold">
                <Gift className="mr-2 text-[#96FF00]" /> You&apos;ve Received {comp}{" "}
                free ticket(s)!
              </div>
            )}

            {tourGuide && (
              <div className="mt-4 flex items-center text-white mb-5 text-lg font-semibold">
                <Info className="mr-2" /> 🎉 You unlocked a free 30-minute tour
                guide
              </div>
            )}

            <div className="w-full pt-4 border-t border-white/20">
              <div className="flex justify-between mb-2">
                <span className="text-white">Price per ticket:</span>
                <span className="text-white">
                  ₹{ticketPrice.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-white text-lg font-semibold">
                <span>Total:</span>
                <span className="text-white">₹{totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </GlassCard>

        {isGift && (
          <GlassCard className="mb-6">
            <h3 className="text-lg font-medium text-white mb-4">
              Gift Information
            </h3>
            <p className="text-sm text-white mb-4">
              Your gift recipient will be able to choose their preferred date
              within the next 3 months.
            </p>
            <div className="text-sm bg-[#2C410E] text-[#96FF00] p-3 rounded-lg">
              Recipient details will be collected in the next step
            </div>
          </GlassCard>
        )}

        <motion.button
          onClick={handleContinue}
          className="w-full py-3 rounded-lg bg-[#99160B] text-white font-medium"
          whileTap={{ scale: 0.98 }}
        >
          Continue
        </motion.button>
      </div>
    </PageTransition>
  );
}
