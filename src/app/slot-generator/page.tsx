"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, CalendarPlus } from "lucide-react";
import { AdminGuard } from "@/components/AdminGuard";
import { getEvents, createSlotsForDate } from "@/lib/db";
import { todayISO } from "@/lib/booking";
import type { EventDoc } from "@/lib/types";

const inputClass =
  "w-full px-3 py-2 bg-[#595959] text-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#96FF00] focus:border-transparent outline-none";

function Generator() {
  const router = useRouter();
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [eventId, setEventId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getEvents()
      .then((evs) => {
        setEvents(evs);
        if (evs[0]) setEventId(evs[0].eventId);
      })
      .catch(() => toast.error("Could not load locations"));
  }, []);

  const generate = async () => {
    if (!eventId || !date) return;
    setBusy(true);
    try {
      const { created, skipped } = await createSlotsForDate(eventId, date);
      if (created === 0 && skipped === 0) {
        toast.error("No slot pattern defined for this location");
      } else {
        toast.success(`${created} slots created, ${skipped} already existed`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate slots");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] p-6">
      <div className="max-w-md mx-auto">
        <div className="mb-6 flex items-center">
          <button
            onClick={() => router.push("/super-admin")}
            className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-md"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="ml-5 font-bold text-[24px] text-white">
            Generate Slots
          </h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#595959] rounded-xl p-6 shadow-lg text-white space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className={inputClass}
            >
              {events.map((e) => (
                <option key={e.eventId} value={e.eventId} className="text-black">
                  {e.location}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              value={date}
              min={todayISO()}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
            />
          </div>

          <p className="text-xs text-white/60">
            Creates this location&apos;s standard slots for the chosen date.
            Existing slots are preserved (booked seats stay intact).
          </p>

          <button
            onClick={generate}
            disabled={busy}
            className="w-full py-3 rounded-xl bg-[#99160B] text-white font-medium flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <CalendarPlus className="w-4 h-4" />
            {busy ? "Generating…" : "Generate Slots"}
          </button>
        </motion.div>
      </div>
    </div>
  );
}

export default function SlotGeneratorPage() {
  return (
    <AdminGuard allowedRoles={["Super Admin"]}>
      <Generator />
    </AdminGuard>
  );
}
