"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Gift } from "lucide-react";
import { toast } from "sonner";
import { bookTicket, createGiftTicket } from "@/lib/db";
import { exGst, gstInclusive, todayISO, totalFor } from "@/lib/booking";
import { digitsOnly, isValidMobile, isValidEmail } from "@/lib/phone";
import { useBooking } from "@/components/BookingProvider";
import { useCustomer } from "@/components/CustomerProvider";

const inputClass =
  "w-full px-3 py-2 bg-[#4a4a4a] text-white placeholder:text-white/60 border border-white/20 rounded-lg outline-none focus:ring-2 focus:ring-[#96FF00]";

export default function PaymentPage() {
  const router = useRouter();
  const { customer } = useCustomer();
  const { event, ticketType, slot, date, isGift, quantity, complimentaryTickets } =
    useBooking();
  const [processing, setProcessing] = useState(false);

  // Gift recipient details
  const [rName, setRName] = useState("");
  const [rMobile, setRMobile] = useState("");
  const [rEmail, setREmail] = useState("");

  useEffect(() => {
    // Gift tickets have no slot/date; normal bookings require both.
    const missingCore = !event || !ticketType;
    const missingSlot = !isGift && (!slot || !date);
    if (missingCore || missingSlot) router.replace("/location");
    else if (!customer) router.replace("/register");
  }, [event, ticketType, slot, date, isGift, customer, router]);

  if (!event || !ticketType || !customer) return null;
  if (!isGift && (!slot || !date)) return null;

  const total = totalFor(ticketType.price, quantity);
  const taxes = gstInclusive(total);
  const subtotal = exGst(total);
  const savings =
    ticketType.originalPrice && ticketType.originalPrice > ticketType.price
      ? Math.round((ticketType.originalPrice - ticketType.price) * quantity)
      : 0;

  const giftValid = rName.trim().length >= 2 && isValidMobile(rMobile);

  const pay = async () => {
    if (isGift && !giftValid) {
      toast.error("Enter the recipient's name and a valid mobile number");
      return;
    }
    if (isGift && rEmail && !isValidEmail(rEmail)) {
      toast.error("Enter a valid recipient email (or leave it blank)");
      return;
    }

    setProcessing(true);
    try {
      // NOTE: payment is mocked — marked paid without a real charge.
      if (isGift) {
        const giftId = await createGiftTicket({
          senderUid: customer.uid,
          senderMobile: customer.mobile,
          event,
          ticketType,
          quantity,
          complimentaryTicket: complimentaryTickets,
          totalAmount: total,
          paymentOption: "online",
          paymentStatus: "paid",
          receiverName: rName.trim(),
          receiverMobile: `+91${digitsOnly(rMobile, 10)}`,
          receiverEmail: rEmail.trim() || undefined,
        });
        toast.success("Gift ticket created");
        router.push(`/confirmation?giftId=${giftId}`);
      } else {
        const ticketId = await bookTicket({
          uid: customer.uid,
          mobile: customer.mobile,
          event,
          ticketType,
          slot: slot!,
          bookingDate: todayISO(),
          quantity,
          complimentaryTicket: complimentaryTickets,
          totalAmount: total,
          paymentOption: "online",
          paymentStatus: "paid",
        });
        toast.success("Booking confirmed");
        router.push(`/confirmation?ticketId=${ticketId}`);
      }
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Booking failed");
      setProcessing(false);
    }
  };

  const row = (label: string, value: string) => (
    <div className="flex justify-between text-sm">
      <span className="text-white/70">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#121212] p-6">
      <div className="max-w-md mx-auto">
        <div className="mb-6 flex items-center">
          <button
            onClick={() => router.push(isGift ? "/quantity" : "/slot-selection")}
            className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-md"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="ml-5 font-bold text-[24px] text-white">Payment</h1>
        </div>

        {/* Gift recipient */}
        {isGift && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#595959] rounded-xl p-6 shadow-lg text-white space-y-3 mb-4"
          >
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Gift className="w-5 h-5 text-[#96FF00]" /> Recipient Details
            </h2>
            <input
              className={inputClass}
              placeholder="Recipient name *"
              value={rName}
              onChange={(e) => setRName(e.target.value)}
            />
            <input
              className={inputClass}
              placeholder="Recipient mobile (10 digits) *"
              inputMode="numeric"
              value={rMobile}
              onChange={(e) => setRMobile(digitsOnly(e.target.value, 10))}
            />
            <input
              className={inputClass}
              placeholder="Recipient email (optional)"
              type="email"
              value={rEmail}
              onChange={(e) => setREmail(e.target.value)}
            />
            <p className="text-xs text-white/60">
              Gift tickets are valid for 3 months. The recipient picks a date &amp;
              time when they redeem it.
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#595959] rounded-xl p-6 shadow-lg text-white space-y-3"
        >
          <h2 className="font-semibold text-lg mb-2">
            {isGift ? "Gift Summary" : "Booking Summary"}
          </h2>
          {row("Location", event.location)}
          {row("Ticket", ticketType.typeName)}
          {isGift ? (
            row("Type", "Gift Ticket")
          ) : (
            <>
              {row(
                "Date",
                new Date(date!).toLocaleDateString("en-US", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                }),
              )}
              {row("Time", slot!.slotTime)}
            </>
          )}
          {row("Quantity", String(quantity))}
          {complimentaryTickets > 0 &&
            row("Complimentary", `+${complimentaryTickets}`)}
          <div className="border-t border-white/15 my-2" />
          {row("Ticket Price", `₹${ticketType.price.toFixed(2)} x ${quantity}`)}
          {row("Subtotal (ex-GST)", `₹${subtotal.toLocaleString()}`)}
          {row("GST (18% incl.)", `₹${taxes.toLocaleString()}`)}
          {savings > 0 && (
            <div className="flex justify-between text-sm text-yellow-300">
              <span>You save</span>
              <span>₹{savings.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-[#96FF00]">₹{total.toLocaleString()}</span>
          </div>

          <div className="mt-4 rounded-lg bg-[#96FF00]/10 text-[#96FF00] text-xs p-3">
            Payment is mocked in this build — clicking below confirms without a
            real charge. Razorpay can be wired in later.
          </div>

          <button
            onClick={pay}
            disabled={processing}
            className="mt-2 w-full py-3 rounded-xl bg-[#99160B] text-white font-medium flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <CreditCard className="w-4 h-4" />
            {processing ? "Processing…" : `Pay ₹${total} (mock)`}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
