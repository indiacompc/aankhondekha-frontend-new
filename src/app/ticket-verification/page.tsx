"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, Search, CheckCircle2, XCircle } from "lucide-react";
import { AdminGuard } from "@/components/AdminGuard";
import { getTicketById, checkInTicket } from "@/lib/db";
import type { Ticket } from "@/lib/types";

function Verification() {
  const router = useRouter();
  const [ticketId, setTicketId] = useState("");
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [searched, setSearched] = useState(false);
  const [busy, setBusy] = useState(false);

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketId.trim()) return;
    setBusy(true);
    setSearched(false);
    try {
      const t = await getTicketById(ticketId.trim());
      setTicket(t);
      setSearched(true);
      if (!t) toast.error("Ticket not found");
    } catch {
      toast.error("Lookup failed");
    } finally {
      setBusy(false);
    }
  };

  const checkIn = async () => {
    if (!ticket) return;
    setBusy(true);
    try {
      const updated = await checkInTicket(ticket.id);
      setTicket(updated);
      toast.success("Checked in");
    } catch {
      toast.error("Check-in failed");
    } finally {
      setBusy(false);
    }
  };

  const row = (label: string, value: string) => (
    <div className="flex justify-between text-sm">
      <span className="text-white/70">{label}</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#121212] p-6">
      <div className="max-w-md mx-auto">
        <div className="mb-6 flex items-center">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-md"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="ml-5 font-bold text-[24px] text-white">
            Verify Ticket
          </h1>
        </div>

        <form onSubmit={lookup} className="flex gap-2 mb-6">
          <input
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
            placeholder="Enter ticket ID"
            className="flex-1 px-4 py-2 bg-[#595959] text-white placeholder:text-white/60 rounded-lg outline-none focus:ring-2 focus:ring-[#96FF00]"
          />
          <button
            type="submit"
            disabled={busy}
            className="px-4 rounded-lg bg-[#99160B] text-white flex items-center gap-1 disabled:opacity-60"
          >
            <Search className="w-4 h-4" /> Find
          </button>
        </form>

        {searched && ticket && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#595959] rounded-xl p-6 shadow-lg text-white"
          >
            <div
              className={`flex items-center gap-2 mb-4 ${
                ticket.isValid ? "text-[#96FF00]" : "text-red-400"
              }`}
            >
              {ticket.isValid ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <XCircle className="w-6 h-6" />
              )}
              <span className="font-semibold">
                {ticket.isValid ? "Valid ticket" : "Already checked in"}
              </span>
            </div>

            <div className="space-y-2">
              {row("Ticket ID", ticket.id)}
              {row("Location", ticket.location)}
              {row("Type", ticket.typeName)}
              {row("Date", ticket.slotDate)}
              {row("Time", ticket.slotTime)}
              {row(
                "Quantity",
                `${ticket.quantity}${
                  ticket.complimentaryTicket
                    ? ` (+${ticket.complimentaryTicket})`
                    : ""
                }`,
              )}
              {row("Mobile", ticket.mobile)}
            </div>

            {ticket.isValid && (
              <button
                onClick={checkIn}
                disabled={busy}
                className="mt-5 w-full py-3 rounded-xl bg-[#96FF00] text-black font-semibold disabled:opacity-60"
              >
                {busy ? "…" : "Check In"}
              </button>
            )}
          </motion.div>
        )}

        {searched && !ticket && (
          <p className="text-white/60 text-center">No ticket with that ID.</p>
        )}
      </div>
    </div>
  );
}

export default function TicketVerificationPage() {
  return (
    <AdminGuard allowedRoles={["Reception Admin", "Ops Admin", "Super Admin"]}>
      <Verification />
    </AdminGuard>
  );
}
