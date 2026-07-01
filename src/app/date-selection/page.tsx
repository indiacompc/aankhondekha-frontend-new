"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { format, isToday, isBefore } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import BackButton from "@/components/BackButton";
import GlassCard from "@/components/GlassCard";
import PageTransition from "@/components/PageTransition";
import { useBooking } from "@/components/BookingProvider";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function DateSelection() {
  const router = useRouter();
  const { event, ticketType, date, setDate } = useBooking();
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    date ? new Date(date) : null,
  );
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (!event || !ticketType) router.replace("/location");
  }, [event, ticketType, router]);

  const prevMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  const nextMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );

  const calendarDays = (() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
    return days;
  })();

  const today = new Date();

  const handleContinue = () => {
    if (!selectedDate) return;
    setDate(
      `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`,
    );
    router.push("/slot-selection");
  };

  if (!event || !ticketType) return null;

  return (
    <PageTransition>
      <div className="bg-[#121212] min-h-screen flex flex-col px-4 py-6">
        <div className="mb-6 flex items-center">
          <BackButton />
          <h1 className="font-aileron ml-5 font-bold text-[24px] leading-[110%] text-white">
            Select Date
          </h1>
        </div>

        <GlassCard className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 transition-colors flex items-center justify-center text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h3 className="text-lg font-medium text-white">
              {format(currentMonth, "MMMM yyyy")}
            </h3>
            <button
              onClick={nextMonth}
              className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 transition-colors flex items-center justify-center text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center mb-4">
            {weekDays.map((day) => (
              <div key={day} className="text-xs text-white/70 font-medium py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => {
              if (!day) return <div key={`empty-${index}`} className="h-10" />;
              const isPast = isBefore(day, today) && !isToday(day);
              const isSelected = selectedDate
                ? day.toDateString() === selectedDate.toDateString()
                : false;
              return (
                <button
                  key={day.toDateString()}
                  disabled={isPast}
                  onClick={() => !isPast && setSelectedDate(day)}
                  className={`h-10 rounded-full flex items-center justify-center text-sm text-white transition-all
                    ${isPast ? "text-white/30" : "hover:bg-[#96FF00]/10"}
                    ${isSelected ? "bg-[#96FF00] !text-black" : ""}`}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
        </GlassCard>

        <motion.button
          onClick={handleContinue}
          disabled={!selectedDate}
          className={`w-full py-3 rounded-lg bg-[#99160B] text-white font-medium ${
            !selectedDate ? "opacity-50 cursor-not-allowed" : ""
          }`}
          whileTap={{ scale: selectedDate ? 0.98 : 1 }}
        >
          Continue
        </motion.button>
      </div>
    </PageTransition>
  );
}
