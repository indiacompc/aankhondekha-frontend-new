"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, DollarSign, Gift, Receipt, Check } from "lucide-react";
import { toast } from "sonner";
import { bookTicket, createGiftTicket } from "@/lib/db";
import { exGst, gstInclusive, todayISO, totalFor } from "@/lib/booking";
import { digitsOnly, isValidMobile, isValidEmail } from "@/lib/phone";
import { notify } from "@/lib/notify";
import { useBooking } from "@/components/BookingProvider";
import { useCustomer } from "@/components/CustomerProvider";
import { useAuth } from "@/components/AuthProvider";
import type { PaymentOption } from "@/lib/types";

const inputClass =
  "w-full px-3 py-2 bg-[#4a4a4a] text-white placeholder:text-white/60 border border-white/20 rounded-lg outline-none focus:ring-2 focus:ring-[#96FF00]";

export default function PaymentPage() {
  const router = useRouter();
  const { customer } = useCustomer();
  const { admin } = useAuth();
  const { event, ticketType, slot, date, isGift, quantity, complimentaryTickets } =
    useBooking();
  const [processing, setProcessing] = useState(false);

  // Payment method — admins can also take Cash / QR / (Ops+Super) Free Ticket.
  const [selectedPayment, setSelectedPayment] = useState<string>("cash");
  const [showQRPopup, setShowQRPopup] = useState(false);

  // Gift recipient details
  const [rName, setRName] = useState("");
  const [rMobile, setRMobile] = useState("");
  const [rEmail, setREmail] = useState("");

  useEffect(() => {
    // Gift tickets have no slot/date; normal bookings require both.
    const missingCore = !event || !ticketType;
    const missingSlot = !isGift && (!slot || !date);
    if (missingCore || missingSlot) router.replace("/location");
    // A profile without a uid can't own a ticket — send them to register.
    else if (!customer?.uid) router.replace("/register");
  }, [event, ticketType, slot, date, isGift, customer, router]);

  if (!event || !ticketType || !customer?.uid) return null;
  if (!isGift && (!slot || !date)) return null;

  const total = totalFor(ticketType.price, quantity);
  const taxes = gstInclusive(total);
  const subtotal = exGst(total);
  const savings =
    ticketType.originalPrice && ticketType.originalPrice > ticketType.price
      ? Math.round((ticketType.originalPrice - ticketType.price) * quantity)
      : 0;

  const giftValid = rName.trim().length >= 2 && isValidMobile(rMobile);

  // Payment methods: Cash / QR for everyone; Ops/Super Admins can issue a Free
  // Ticket. Online (Razorpay) is not enabled yet.
  const paymentMethods: { id: string; name: string; icon: React.ReactNode }[] = [
    { id: "cash", name: "Cash Payment", icon: <DollarSign className="h-5 w-5 text-white" /> },
    { id: "qr", name: "QR Payment", icon: <CreditCard className="h-5 w-5 text-white" /> },
  ];
  if (admin?.role === "Ops Admin" || admin?.role === "Super Admin") {
    paymentMethods.push({ id: "free", name: "Free Ticket", icon: <Receipt className="h-5 w-5 text-white" /> });
  }

  const qrSrc =
    event.eventId === "2"
      ? "/qr_bhopal.png"
      : event.eventId === "3"
        ? "/0316201003158_QR_TELLME_Boat Club.png"
        : "/qr.jpg";

  /** Map the selected method to the stored PaymentOption and charged amount. */
  const resolvePayment = (): { option: PaymentOption; amount: number } => {
    if (selectedPayment === "free") return { option: "Free Ticket", amount: 0 };
    if (selectedPayment === "qr") return { option: "qr", amount: total };
    return { option: "cash", amount: total };
  };

  const selectPayment = (id: string) => {
    setSelectedPayment(id);
    setShowQRPopup(id === "qr");
  };

  const adminTag = admin ? admin.legacyUsername ?? admin.email ?? admin.uid : null;

  const pay = async () => {
    if (isGift && !giftValid) {
      toast.error("Enter the recipient's name and a valid mobile number");
      return;
    }
    if (isGift && rEmail && !isValidEmail(rEmail)) {
      toast.error("Enter a valid recipient email (or leave it blank)");
      return;
    }

    const { option: paymentOption, amount } = resolvePayment();

    setProcessing(true);
    try {
      // Online payment is mocked (Razorpay to be wired); cash/qr/free are
      // recorded directly and marked paid.
      if (isGift) {
        const giftId = await createGiftTicket({
          senderUid: customer.uid,
          senderMobile: customer.mobile,
          event,
          ticketType,
          quantity,
          complimentaryTicket: complimentaryTickets,
          totalAmount: amount,
          paymentOption,
          paymentStatus: "paid",
          receiverName: rName.trim(),
          receiverMobile: `+91${digitsOnly(rMobile, 10)}`,
          receiverEmail: rEmail.trim() || undefined,
        });
        // Notify the recipient (WhatsApp + SMS) that they've received a gift.
        notify({
          type: "gift",
          mobile: `+91${digitsOnly(rMobile, 10)}`,
          name: customer.name || "Someone",
        });
        toast.success("Gift ticket created");
        router.push(`/confirmation?giftId=${giftId}`);
      } else {
        const ticketId = await bookTicket({
          uid: customer.uid,
          mobile: customer.mobile,
          customerName: customer.name,
          event,
          ticketType,
          slot: slot!,
          bookingDate: todayISO(),
          quantity,
          complimentaryTicket: complimentaryTickets,
          totalAmount: amount,
          gstAmount: paymentOption === "Free Ticket" ? 0 : undefined,
          paymentOption,
          paymentStatus: "paid",
          adminId: adminTag,
        });
        // Notify the customer (WhatsApp + SMS) that the booking is confirmed.
        notify({
          type: "booking",
          mobile: customer.mobile,
          date: new Date(date!).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          time: slot!.slotTime,
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
            <span className="text-[#96FF00]">
              ₹{(selectedPayment === "free" ? 0 : total).toLocaleString()}
            </span>
          </div>

          {/* Payment method selection */}
          <div className="pt-2">
            <p className="text-white text-sm font-semibold mb-2">Select Payment Method</p>
            <div className="space-y-2">
              {paymentMethods.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => selectPayment(m.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition ${
                    selectedPayment === m.id
                      ? "border-2 border-[#96FF00] bg-[#2C410E]"
                      : "border border-white/15 bg-[#2C410E]/40 hover:bg-[#2C410E]"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-full bg-[#121212] flex items-center justify-center">
                      {m.icon}
                    </span>
                    <span className="text-white text-sm font-medium">{m.name}</span>
                  </span>
                  {selectedPayment === m.id && (
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-[#96FF00]">
                      <Check className="h-4 w-4 text-black" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={pay}
            disabled={processing}
            className="mt-2 w-full py-3 rounded-xl bg-[#99160B] text-white font-medium flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <CreditCard className="w-4 h-4" />
            {processing
              ? "Processing…"
              : selectedPayment === "qr"
                ? "Confirm QR Payment"
                : selectedPayment === "free"
                  ? "Confirm Free Ticket"
                  : "Confirm Cash Payment"}
          </button>
        </motion.div>
      </div>

      {/* QR payment popup */}
      {showQRPopup && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <button
            className="absolute top-4 right-6 text-white text-3xl font-bold"
            onClick={() => setShowQRPopup(false)}
            aria-label="Close"
          >
            &times;
          </button>
          <div className="p-4 bg-[#1f1f1f] rounded-lg shadow-lg max-w-md w-full text-center">
            <h2 className="text-white text-lg mb-4">Scan to Pay via QR</h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrSrc}
              alt="Scan QR to pay"
              className="w-full max-w-xs mx-auto rounded-md border border-gray-300"
            />
            <p className="text-white/60 text-xs mt-3">Amount: ₹{total.toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}
