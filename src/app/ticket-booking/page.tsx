"use client";

import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import BackButton from "@/components/BackButton";
import { AdminGuard } from "@/components/AdminGuard";
import { useAuth } from "@/components/AuthProvider";
import {
  getEvents,
  getSlots,
  getTicketTypes,
  bookTicket,
  registerCustomer,
} from "@/lib/db";
import { totalFor, gstInclusive } from "@/lib/booking";
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

const fmtDate = (d: Date) => d.toLocaleDateString("en-CA"); // YYYY-MM-DD local

function ManualBooking() {
  const { admin } = useAuth();

  const [events, setEvents] = useState<EventDoc[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [types, setTypes] = useState<TicketType[]>([]);

  // Customer Info
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [ageGroup, setAgeGroup] = useState("");

  // Ticket Info
  const [ticketMobile, setTicketMobile] = useState("");
  const [eventId, setEventId] = useState("");
  const [bookingDate, setBookingDate] = useState<Date | null>(new Date());
  const [slotId, setSlotId] = useState("");
  const [ticketTypeId, setTicketTypeId] = useState("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [complimentary, setComplimentary] = useState(0);
  const [gstAmount, setGstAmount] = useState<number | "">("");
  const [totalAmount, setTotalAmount] = useState<number | "">("");
  const [paymentOption, setPaymentOption] = useState<PaymentOption>("cash");
  const [busy, setBusy] = useState(false);

  const [popup, setPopup] = useState<{ msg: string; ok: boolean } | null>(null);
  const notify = (msg: string, ok: boolean) => setPopup({ msg, ok });

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
    getSlots(eventId, fmtDate(bookingDate), true).then(setSlots);
    setSlotId("");
  }, [eventId, bookingDate]);

  // Auto-fill Total & GST when ticket type / quantity change (still editable).
  useEffect(() => {
    if (paymentOption === "Free Ticket") {
      setTotalAmount(0);
      setGstAmount(0);
      return;
    }
    const t = types.find((x) => x.id === ticketTypeId);
    if (!t || !quantity) return;
    const total = totalFor(t.price, Number(quantity));
    setTotalAmount(total);
    setGstAmount(gstInclusive(total));
  }, [ticketTypeId, quantity, paymentOption, types]);

  const reset = () => {
    setName("");
    setMobile("");
    setEmail("");
    setGender("");
    setAgeGroup("");
    setTicketMobile("");
    setSlotId("");
    setTicketTypeId("");
    setQuantity("");
    setComplimentary(0);
    setGstAmount("");
    setTotalAmount("");
    setPaymentOption("cash");
  };

  const handleRegisterCustomer = async () => {
    if (!name || mobile.length !== 10 || !gender || !ageGroup)
      return notify("❗ Fill all required customer fields", false);
    setBusy(true);
    try {
      const res = await registerCustomer(mobile, { name, email, gender, ageGroup });
      if (res === "exists") notify("⚠️ Customer already exists", false);
      else notify("✅ Customer registered successfully", true);
    } catch (err) {
      console.error(err);
      notify("❌ Customer registration failed", false);
    } finally {
      setBusy(false);
    }
  };

  const handleBookTicket = async () => {
    const event = events.find((e) => e.eventId === eventId);
    const slot = slots.find((s) => s.id === slotId);
    const ticketType = types.find((t) => t.id === ticketTypeId);
    if (
      ticketMobile.length !== 10 || !bookingDate || !slot || !ticketType ||
      !quantity || totalAmount === "" || !event || !admin
    )
      return notify("❗ Fill all required ticket fields", false);
    if (slot.availableSeats < Number(quantity) + complimentary)
      return notify("❗ Not enough seats in this slot", false);

    setBusy(true);
    try {
      await bookTicket({
        uid: ticketMobile,
        mobile: `+91${ticketMobile}`,
        customerName: ticketMobile === mobile ? name : "",
        event,
        ticketType,
        slot,
        bookingDate: fmtDate(bookingDate),
        quantity: Number(quantity),
        complimentaryTicket: complimentary,
        totalAmount: Number(totalAmount),
        gstAmount: gstAmount === "" ? undefined : Number(gstAmount),
        paymentOption,
        paymentStatus: "paid",
        adminId: admin.legacyUsername ?? admin.email ?? admin.uid,
      });
      notify("✅ Ticket booked successfully", true);
    } catch (err) {
      console.error(err);
      notify("❌ Ticket booking failed", false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white p-8 max-w-5xl mx-auto relative">
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
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <label className={labelClass}>Age Group</label>
          <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className={inputClass}>
            <option value="">Select Age Group</option>
            <option value="16-25">16-25</option>
            <option value="25-40">25-40</option>
            <option value="40+">40+</option>
          </select>
          <button
            onClick={handleRegisterCustomer}
            disabled={busy}
            className="bg-[#96FF00] text-black font-bold py-2 px-4 rounded mt-4 w-full disabled:opacity-60"
          >
            Register Customer
          </button>
        </div>

        {/* Ticket Info */}
        <div className="bg-[#1c1c1c] border border-[#96FF00] p-6 rounded">
          <h2 className="font-semibold mb-4 text-center">Ticket Info</h2>
          <label className={labelClass}>Customer Mobile No</label>
          <input
            className={inputClass}
            inputMode="numeric"
            value={ticketMobile}
            onChange={(e) => setTicketMobile(digitsOnly(e.target.value, 10))}
          />
          <label className={labelClass}>Event Location</label>
          <select value={eventId} onChange={(e) => setEventId(e.target.value)} className={inputClass}>
            {events.map((e) => (
              <option key={e.eventId} value={e.eventId}>
                {e.location}
              </option>
            ))}
          </select>
          <label className={labelClass}>Booking Date</label>
          <DatePicker
            selected={bookingDate}
            onChange={(date: Date | null) => setBookingDate(date)}
            className={inputClass}
            dateFormat="yyyy-MM-dd"
            minDate={new Date()}
            placeholderText="Select booking date"
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
            onChange={(e) => setQuantity(e.target.value === "" ? "" : Math.max(1, Number(e.target.value)))}
          />
          <label className={labelClass}>Complimentary Ticket</label>
          <input
            type="number"
            min={0}
            className={inputClass}
            value={complimentary}
            onChange={(e) => setComplimentary(Math.max(0, Number(e.target.value)))}
          />
          <label className={labelClass}>GST Amount</label>
          <input
            type="number"
            min={0}
            className={inputClass}
            value={gstAmount}
            onChange={(e) => setGstAmount(e.target.value === "" ? "" : Number(e.target.value))}
          />
          <label className={labelClass}>Total Amount</label>
          <input
            type="number"
            min={0}
            className={inputClass}
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value === "" ? "" : Number(e.target.value))}
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

          <button
            onClick={handleBookTicket}
            disabled={busy}
            className="bg-[#96FF00] text-black font-bold py-2 px-4 rounded mt-4 w-full disabled:opacity-60"
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
