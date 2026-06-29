"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import { CheckCircle2, Home } from "lucide-react";
import { getTicketById } from "@/lib/db";
import type { Ticket } from "@/lib/types";
import { useBooking } from "@/components/BookingProvider";

function Confirmation() {
  const params = useSearchParams();
  const ticketId = params.get("ticketId");
  const { clearBooking } = useBooking();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clearBooking(); // booking is finalised; reset in-flight selections
    if (!ticketId) {
      setLoading(false);
      return;
    }
    getTicketById(ticketId)
      .then(setTicket)
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

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
        ) : !ticket ? (
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
              <h1 className="text-xl font-bold mt-2">Booking Confirmed</h1>
              <p className="text-white/60 text-sm">Show this QR at the entrance</p>
            </div>

            <div className="bg-white rounded-xl p-4 flex flex-col items-center mb-4">
              <QRCodeCanvas value={ticket.id} size={180} />
              <p className="text-black text-xs mt-2 font-mono break-all">
                {ticket.id}
              </p>
            </div>

            <div className="space-y-2">
              {row("Location", ticket.location)}
              {row("Ticket", ticket.typeName)}
              {row(
                "Date",
                new Date(ticket.slotDate).toLocaleDateString("en-US", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                }),
              )}
              {row("Time", ticket.slotTime)}
              {row("Quantity", String(ticket.quantity))}
              {ticket.complimentaryTicket > 0 &&
                row("Complimentary", `+${ticket.complimentaryTicket}`)}
              {row("Paid", `₹${ticket.totalAmount} (${ticket.paymentOption})`)}
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
