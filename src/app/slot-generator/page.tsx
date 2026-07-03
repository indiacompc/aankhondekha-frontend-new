"use client";

import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import BackButton from "@/components/BackButton";
import { AdminGuard } from "@/components/AdminGuard";
import { getEvents, createSlotsForDate } from "@/lib/db";
import type { EventDoc } from "@/lib/types";

// returns YYYY-MM-DD in local time (matches the old app's formatLocalDate)
const formatLocalDate = (date: Date) => date.toLocaleDateString("en-CA");

function SlotCard({ event }: { event: EventDoc }) {
  const [date, setDate] = useState<Date | null>(null);
  const [message, setMessage] = useState("");

  const generate = async () => {
    if (!date) return setMessage(`❗ Please select ${event.location} date`);
    setMessage(`⏳ Generating ${event.location} slots...`);
    try {
      const { created, skipped } = await createSlotsForDate(
        event.eventId,
        formatLocalDate(date),
      );
      if (created === 0 && skipped === 0) {
        setMessage("❌ No slot pattern defined for this location");
      } else {
        setMessage(`✅ ${created} slots created, ${skipped} already existed`);
      }
    } catch (error) {
      setMessage(`❌ Error generating ${event.location} slots`);
      console.error(error);
    }
  };

  return (
    <div className="bg-[#1c1c1c] p-6 border border-[#96FF00] rounded w-full">
      <h2 className="text-lg font-semibold mb-4 text-white text-center">
        Generate {event.location} Slots
      </h2>
      <div className="flex flex-col gap-3 items-center">
        <DatePicker
          selected={date}
          onChange={(d: Date | null) => setDate(d)}
          dateFormat="yyyy-MM-dd"
          placeholderText={`Select ${event.location} date`}
          minDate={new Date()}
          className="bg-[#1f1f1f] text-white border border-[#96FF00] rounded px-4 py-2 w-full"
        />

        <button
          onClick={generate}
          className="bg-[#96FF00] text-black px-4 py-2 rounded font-semibold w-full"
        >
          Generate {event.location} Slots
        </button>

        {message && (
          <p className="mt-2 text-center text-sm text-green-400 font-semibold">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

function Generator() {
  const [events, setEvents] = useState<EventDoc[]>([]);

  useEffect(() => {
    getEvents().then(setEvents).catch(() => setEvents([]));
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] text-white p-8 max-w-5xl mx-auto">
      <BackButton />
      <h1 className="text-2xl font-bold mb-6 text-center text-[#96FF00]">
        Slot Generator
      </h1>

      <div className="flex flex-col md:flex-row gap-6 justify-between">
        {events.map((e) => (
          <SlotCard key={e.eventId} event={e} />
        ))}
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
