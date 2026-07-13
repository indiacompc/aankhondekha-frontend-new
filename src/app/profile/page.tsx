"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, LogOut } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "sonner";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getTicketsByMobile } from "@/lib/db";
import { useCustomer } from "@/components/CustomerProvider";
import type { GiftTicket, Ticket } from "@/lib/types";

type Row = {
  id: string;
  slotDate?: string;
  slotTime?: string;
  quantity: number;
  typeName: string;
  location: string;
  isValid: boolean;
  isGift: boolean;
};

export default function ProfilePage() {
  const router = useRouter();
  const { customer, clearCustomer } = useCustomer();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customer?.mobile) {
      toast.error("Please log in to view your profile");
      router.replace("/login");
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const { tickets, giftTickets } = await getTicketsByMobile(customer.mobile);
        setRows([
          ...tickets.map((t: Ticket) => ({
            id: t.id,
            slotDate: t.slotDate,
            slotTime: t.slotTime,
            quantity: (t.quantity || 0) + (t.complimentaryTicket || 0),
            typeName: t.typeName,
            location: t.location,
            isValid: t.isValid,
            isGift: false,
          })),
          ...giftTickets.map((g: GiftTicket) => ({
            id: g.id,
            slotDate: undefined,
            slotTime: "Gift ticket — pick a slot at check-in",
            quantity: (g.quantity || 0) + (g.complimentaryTicket || 0),
            typeName: g.typeName,
            location: g.location,
            isValid: g.isValid,
            isGift: true,
          })),
        ]);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load your tickets");
      } finally {
        setLoading(false);
      }
    })();
  }, [customer, router]);

  const initials = useMemo(
    () =>
      (customer?.name || "?")
        .split(" ")
        .map((s) => s[0])
        .slice(0, 2)
        .join("")
        .toUpperCase(),
    [customer?.name],
  );

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {
      /* ignore */
    }
    clearCustomer();
    toast.success("Logged out successfully");
    router.push("/");
  };

  if (!customer?.mobile) return null;

  return (
    <div className="min-h-screen bg-[#121212] p-6">
      <div className="max-w-md mx-auto">
        <div className="mb-6 flex items-center">
          <button
            onClick={() => router.push("/")}
            className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-md"
            aria-label="Home"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="ml-5 font-bold text-[24px] text-white">Profile</h1>
        </div>

        {/* User details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-[#595959] rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-[#96FF00] text-black font-bold text-lg flex items-center justify-center">
              {initials}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{customer.name}</h2>
              <p className="text-white/70 text-sm">{customer.mobile}</p>
            </div>
          </div>
          <div className="space-y-1 text-white text-sm">
            {customer.email && (
              <p>
                <span className="text-white/60">Email: </span>
                {customer.email}
              </p>
            )}
            <p>
              <span className="text-white/60">Gender: </span>
              {customer.gender || "—"}
            </p>
            <p>
              <span className="text-white/60">Age Group: </span>
              {customer.ageGroup || "—"}
            </p>
          </div>
        </motion.div>

        {/* Booked tickets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-6 bg-[#595959] rounded-xl p-6 shadow-lg"
        >
          <h2 className="text-lg font-bold text-center text-white">Booked Tickets</h2>
          <p className="text-xs text-white/70 text-center mb-4">
            Show the QR code at the ticket counter for verification.
          </p>

          {loading ? (
            <p className="text-white/70">Loading tickets…</p>
          ) : rows.length === 0 ? (
            <p className="text-white/70 text-center">No tickets booked yet.</p>
          ) : (
            <div className="space-y-4">
              {rows.map((t) => (
                <div
                  key={t.id}
                  className={`relative bg-[#444] rounded-lg p-4 flex justify-between items-center gap-3 ${
                    !t.isValid ? "opacity-60" : ""
                  }`}
                >
                  {!t.isValid && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-red-600 text-3xl font-bold rotate-[-30deg]">
                        USED
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="text-[#96FF00] font-bold text-sm break-all">
                      {t.isGift ? "Gift " : ""}#{t.id}
                    </span>
                    <span className="text-white text-sm">{t.location}</span>
                    <span className="text-white/80 text-xs">{t.typeName}</span>
                    {t.slotDate && (
                      <span className="text-white/80 text-xs">{t.slotDate}</span>
                    )}
                    <span className="text-white/80 text-xs">{t.slotTime}</span>
                    <span className="text-white/80 text-xs">Qty: {t.quantity}</span>
                  </div>
                  <div className="bg-white p-1.5 rounded flex-shrink-0">
                    <QRCodeCanvas value={t.id} size={92} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <button
          onClick={logout}
          className="mt-6 w-full py-3 rounded-xl bg-[#99160B] text-white font-medium flex items-center justify-center gap-2"
        >
          <LogOut className="h-5 w-5" /> Logout
        </button>
      </div>
    </div>
  );
}
