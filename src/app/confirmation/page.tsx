"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import { CheckCircle2, Home } from "lucide-react";
import { getTicketById, getGiftTicketById } from "@/lib/db";
import { useBooking } from "@/components/BookingProvider";

interface DisplayRecord {
  id: string;
  isGift: boolean;
  location: string;
  typeName: string;
  slotDate?: string;
  slotTime?: string;
  expiryDate?: string;
  receiverName?: string;
  quantity: number;
  complimentaryTicket: number;
  totalAmount: number;
  paymentOption: string;
}

function Confirmation() {
  const params = useSearchParams();
  const ticketId = params.get("ticketId");
  const giftId = params.get("giftId");
  const { clearBooking } = useBooking();
  const [record, setRecord] = useState<DisplayRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clearBooking(); // booking is finalised; reset in-flight selections
    const load = async () => {
      if (giftId) {
        const g = await getGiftTicketById(giftId);
        if (g)
          setRecord({
            id: g.id,
            isGift: true,
            location: g.location,
            typeName: g.typeName,
            expiryDate: g.expiryDate,
            receiverName: g.receiverName,
            quantity: g.quantity,
            complimentaryTicket: g.complimentaryTicket,
            totalAmount: g.totalAmount,
            paymentOption: g.paymentOption,
          });
      } else if (ticketId) {
        const t = await getTicketById(ticketId);
        if (t)
          setRecord({
            id: t.id,
            isGift: false,
            location: t.location,
            typeName: t.typeName,
            slotDate: t.slotDate,
            slotTime: t.slotTime,
            quantity: t.quantity,
            complimentaryTicket: t.complimentaryTicket,
            totalAmount: t.totalAmount,
            paymentOption: t.paymentOption,
          });
      }
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId, giftId]);

  const row = (label: string, value: string) => (
    <div className="flex justify-between text-sm">
      <span className="text-white/70">{label}</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#121212] p-6 flex flex-col items-center">
      <div className="max-w-md w-full mx-auto">
        {loading ? (
          <p className="text-white/70 mt-20 text-center">Loading ticket…</p>
        ) : !record ? (
          <div className="mt-20 text-center text-white/70">
            <p>Ticket not found.</p>
            <Link href="/" className="text-[#96FF00] underline mt-2 inline-block">
              Back to home
            </Link>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-[#595959] rounded-2xl p-6 shadow-lg text-white"
          >
            <div className="flex flex-col items-center text-center mb-4">
              <CheckCircle2 className="w-12 h-12 text-[#96FF00]" />
              <h1 className="text-xl font-bold mt-2">
                {record.isGift ? "Gift Ticket Ready" : "Booking Confirmed"}
              </h1>
              <p className="text-white/60 text-sm">
                {record.isGift
                  ? "Share this QR with the recipient"
                  : "Show this QR at the entrance"}
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 flex flex-col items-center mb-4">
              <QRCodeCanvas value={record.id} size={180} />
              <p className="text-black text-xs mt-2 font-mono break-all">
                {record.id}
              </p>
            </div>

            <div className="space-y-2">
              {row("Location", record.location)}
              {row("Ticket", record.typeName)}
              {record.isGift ? (
                <>
                  {record.receiverName && row("For", record.receiverName)}
                  {record.expiryDate && row("Valid until", record.expiryDate)}
                </>
              ) : (
                <>
                  {row(
                    "Date",
                    new Date(record.slotDate!).toLocaleDateString("en-US", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    }),
                  )}
                  {row("Time", record.slotTime!)}
                </>
              )}
              {row("Quantity", String(record.quantity))}
              {record.complimentaryTicket > 0 &&
                row("Complimentary", `+${record.complimentaryTicket}`)}
              {row("Paid", `₹${record.totalAmount} (${record.paymentOption})`)}
            </div>

            <Link
              href="/"
              className="mt-6 w-full py-3 rounded-xl bg-[#99160B] text-white font-medium flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" /> Back to Home
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#121212]" />}>
      <Confirmation />
    </Suspense>
  );
}
