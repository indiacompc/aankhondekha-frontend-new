"use client";

import { useEffect, useState } from "react";
import BackButton from "@/components/BackButton";
import { AdminGuard } from "@/components/AdminGuard";
import { useAuth } from "@/components/AuthProvider";
import {
  getEvents,
  getSlots,
  getTicketTypes,
  bookTicket,
} from "@/lib/db";
import { totalFor, todayISO } from "@/lib/booking";
import { digitsOnly } from "@/lib/phone";
import type { EventDoc, Slot, TicketType, PaymentOption } from "@/lib/types";

const inputClass =
  "w-full px-4 py-2 mb-3 bg-[#1f1f1f] text-white border border-[#96FF00] rounded outline-none focus:ring-2 focus:ring-[#96FF00]";
const labelClass = "block mb-1 text-[#96FF00] text-sm";

const PAYMENT_OPTIONS: { value: PaymentOption; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "online", label: "Online" },
  { value: "qr", label: "QR Payment" },
  { value: "Free Ticket", label: "Free Ticket" },
];

function ManualBooking() {
  const { admin } = useAuth();

  const [events, setEvents] = useState<EventDoc[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [types, setTypes] = useState<TicketType[]>([]);

  // Customer
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [ageGroup, setAgeGroup] = useState("");

  // Ticket
  const [eventId, setEventId] = useState("");
  const [bookingDate, setBookingDate] = useState(todayISO());
  const [slotId, setSlotId] = useState("");
  const [ticketTypeId, setTicketTypeId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [complimentary, setComplimentary] = useState(0);
  const [paymentOption, setPaymentOption] = useState<PaymentOption>("cash");
  const [busy, setBusy] = useState(false);

  const [popup, setPopup] = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    getEvents().then((evs) => {
      setEvents(evs);
      if (evs[0]) setEventId(evs[0].eventId);
    });
  }, []);

  useEffect(() => {
    if (!eventId) return;
    getTicketTypes(eventId).then(setTypes);
  }, [eventId]);

  useEffect(() => {
    if (!eventId || !bookingDate) return;
    getSlots(eventId, bookingDate, true).then(setSlots);
    setSlotId("");
  }, [eventId, bookingDate]);

  const ticketType = types.find((t) => t.id === ticketTypeId);
  const total =
    paymentOption === "Free Ticket" || !ticketType
      ? 0
      : totalFor(ticketType.price, quantity);

  const reset = () => {
    setName("");
    setMobile("");
    setEmail("");
    setGender("");
    setAgeGroup("");
    setSlotId("");
    setTicketTypeId("");
    setQuantity(1);
    setComplimentary(0);
    setPaymentOption("cash");
  };

  const submit = async () => {
    if (!name || mobile.length !== 10 || !gender || !ageGroup)
      return setPopup({ msg: "❗ Fill all required customer fields", ok: false });
    const event = events.find((e) => e.eventId === eventId);
    const slot = slots.find((s) => s.id === slotId);
    if (!event || !slot || !ticketType || !admin)
      return setPopup({ msg: "❗ Select event, slot and ticket type", ok: false });
    if (slot.availableSeats < quantity + complimentary)
      return setPopup({ msg: "❗ Not enough seats in this slot", ok: false });

    setBusy(true);
    try {
      await bookTicket({
        uid: admin.uid,
        mobile: `+91${mobile}`,
        customerName: name,
        event,
        ticketType,
        slot,
        bookingDate,
        quantity,
        complimentaryTicket: complimentary,
        totalAmount: total,
        paymentOption,
        paymentStatus: "paid",
        adminId: admin.uid,
      });
      setPopup({ msg: "✅ Ticket booked successfully", ok: true });
    } catch (err) {
      console.error(err);
      setPopup({ msg: "❌ Ticket booking failed", ok: false });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6 md:p-8 max-w-5xl mx-auto relative">
      <BackButton />
      <h1 className="text-2xl font-bold mb-6 text-center text-[#96FF00]">
        Manual Ticket Booking
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="bg-[#1c1c1c] border border-[#96FF00] p-6 rounded">
          <h2 className="font-semibold mb-4 text-center">Customer Info</h2>
          <label className={labelClass}>Name</label>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
          <label className={labelClass}>Mobile Number</label>
          <input
            className={inputClass}
            inputMode="numeric"
            value={mobile}
            onChange={(e) => setMobile(digitsOnly(e.target.value, 10))}
          />
          <label className={labelClass}>Email (optional)</label>
          <input className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
          <label className={labelClass}>Gender</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)} className={inputClass}>
            <option value="">Select Gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
          <label className={labelClass}>Age Group</label>
          <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className={inputClass}>
            <option value="">Select Age Group</option>
            <option>16-25</option>
            <option>25-40</option>
            <option>40+</option>
          </select>
        </div>

        {/* Ticket Info */}
        <div className="bg-[#1c1c1c] border border-[#96FF00] p-6 rounded">
          <h2 className="font-semibold mb-4 text-center">Ticket Info</h2>
          <label className={labelClass}>Event Location</label>
          <select value={eventId} onChange={(e) => setEventId(e.target.value)} className={inputClass}>
            {events.map((e) => (
              <option key={e.eventId} value={e.eventId}>
                {e.location}
              </option>
            ))}
          </select>
          <label className={labelClass}>Booking Date</label>
          <input
            type="date"
            min={todayISO()}
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
            className={inputClass}
          />
          <label className={labelClass}>Slot</label>
          <select value={slotId} onChange={(e) => setSlotId(e.target.value)} className={inputClass}>
            <option value="">Select Slot</option>
            {slots.map((s) => (
              <option key={s.id} value={s.id}>
                {s.slotTime} ({s.availableSeats} left)
              </option>
            ))}
          </select>
          <label className={labelClass}>Ticket Type</label>
          <select
            value={ticketTypeId}
            onChange={(e) => setTicketTypeId(e.target.value)}
            className={inputClass}
          >
            <option value="">Select Ticket Type</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.typeName} — ₹{t.price}
              </option>
            ))}
          </select>
          <label className={labelClass}>Quantity</label>
          <input
            type="number"
            min={1}
            className={inputClass}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
          />
          <label className={labelClass}>Complimentary Ticket</label>
          <input
            type="number"
            min={0}
            className={inputClass}
            value={complimentary}
            onChange={(e) => setComplimentary(Math.max(0, Number(e.target.value)))}
          />
          <label className={labelClass}>Payment Option</label>
          <select
            value={paymentOption}
            onChange={(e) => setPaymentOption(e.target.value as PaymentOption)}
            className={inputClass}
          >
            {PAYMENT_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          <div className="flex justify-between text-sm mb-3">
            <span className="text-[#96FF00]">Total</span>
            <span>₹{total.toLocaleString()}</span>
          </div>

          <button
            onClick={submit}
            disabled={busy}
            className="bg-[#96FF00] text-black font-bold py-2 px-4 rounded mt-2 w-full disabled:opacity-60"
          >
            {busy ? "Booking…" : "Book Ticket"}
          </button>
        </div>
      </div>

      {popup && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-[#1c1c1c] border border-[#96FF00] p-6 rounded-lg shadow-lg text-center w-96">
            <p className={popup.ok ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
              {popup.msg}
            </p>
            <button
              onClick={() => {
                if (popup.ok) reset();
                setPopup(null);
              }}
              className="mt-4 px-4 py-2 bg-[#96FF00] text-black font-bold rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ManualBookingPage() {
  return (
    <AdminGuard allowedRoles={["Super Admin"]}>
      <ManualBooking />
    </AdminGuard>
  );
}
