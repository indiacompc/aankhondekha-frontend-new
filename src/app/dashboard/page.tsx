"use client";

import { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from "xlsx";
import BackButton from "@/components/BackButton";
import { AdminGuard } from "@/components/AdminGuard";
import { getEvents, getTicketsByDateRange } from "@/lib/db";
import type { EventDoc, Ticket } from "@/lib/types";

const fmtDate = (d: Date) => d.toLocaleDateString("en-CA"); // YYYY-MM-DD local

/** Parse "01:00 PM - 01:15 PM" start into minutes since midnight (for sorting). */
function startMinutes(slotTime: string): number {
  const m = slotTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return 0;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const pm = m[3].toUpperCase() === "PM";
  if (pm && h !== 12) h += 12;
  if (!pm && h === 12) h = 0;
  return h * 60 + min;
}

/** "MP36002_satyam" -> "Satyam"; ids without a suffix are used as-is. */
function adminLabel(adminId: string | null | undefined): string {
  if (!adminId) return "Online / Customer";
  const i = adminId.indexOf("_");
  const name = i >= 0 ? adminId.slice(i + 1) : adminId;
  return name.charAt(0).toUpperCase() + name.slice(1);
}

type Row = Record<string, string | number>;

/** A simple bordered data table. */
function DataTable({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <div className="bg-[#1c1c1c] border border-[#96FF00] rounded p-4 overflow-x-auto mt-6">
      <h2 className="text-lg font-semibold mb-4 text-white">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-gray-400">No data available.</p>
      ) : (
        <table className="min-w-full text-sm border border-[#2C410E] text-white">
          <thead className="bg-[#2C410E]">
            <tr>
              {Object.keys(rows[0]).map((col) => (
                <th key={col} className="px-4 py-2 border-b border-[#4CAF50] text-left whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-[#96FF00]/10">
                {Object.keys(rows[0]).map((col) => (
                  <td key={col} className="px-4 py-2 border-b border-[#333] whitespace-nowrap">
                    {String(row[col] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Dashboard() {
  const today = new Date();
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(today.getDate() - 30)),
  );
  const [endDate, setEndDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getEvents().then(setEvents).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const all = await getTicketsByDateRange(fmtDate(startDate), fmtDate(endDate));
        const filtered = selectedEvent ? all.filter((t) => t.eventId === selectedEvent) : all;
        if (!cancelled) setTickets(filtered);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Failed to fetch ticket stats (a Firestore index may be building).");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [startDate, endDate, selectedEvent]);

  const { perSlot, byType, byAdmin, byDate, bookings, totals } = useMemo(() => {
    const slot: Record<string, number> = {};
    const type: Record<string, number> = {};
    const admin: Record<string, { tickets: number; sales: number }> = {};
    const date: Record<string, { Date: string; Tickets: number; Revenue: number; GST: number }> = {};
    let totalTickets = 0;
    let totalRevenue = 0;
    let totalGst = 0;

    const detail: Row[] = tickets.map((t) => {
      const qty = (t.quantity || 0) + (t.complimentaryTicket || 0);
      totalTickets += qty;
      totalRevenue += t.totalAmount || 0;
      totalGst += t.gstAmount || 0;

      slot[t.slotTime] = (slot[t.slotTime] || 0) + qty;
      type[t.typeName] = (type[t.typeName] || 0) + qty;
      const al = adminLabel(t.adminId);
      admin[al] = admin[al] || { tickets: 0, sales: 0 };
      admin[al].tickets += qty;
      admin[al].sales += t.totalAmount || 0;
      const d = t.bookingDate;
      date[d] = date[d] || { Date: d, Tickets: 0, Revenue: 0, GST: 0 };
      date[d].Tickets += qty;
      date[d].Revenue += t.totalAmount || 0;
      date[d].GST += t.gstAmount || 0;

      return {
        "Ticket ID": t.id,
        Date: t.bookingDate,
        Location: t.location,
        "Ticket Type": t.typeName,
        Slot: t.slotTime,
        Mobile: t.mobile,
        Customer: t.customerName || "",
        Qty: t.quantity,
        Comp: t.complimentaryTicket || 0,
        "Total (₹)": Math.round(t.totalAmount || 0),
        "GST (₹)": Math.round(t.gstAmount || 0),
        Payment: t.paymentOption,
        Status: t.isValid ? "Valid" : "Used",
        Admin: adminLabel(t.adminId),
      };
    });

    return {
      perSlot: Object.entries(slot)
        .map(([Slot, Tickets]) => ({ Slot, "Tickets Booked": Tickets }))
        .sort((a, b) => startMinutes(a.Slot) - startMinutes(b.Slot)),
      byType: Object.entries(type).map(([Type, Booked]) => ({ "Ticket Type": Type, "Total Booked": Booked })),
      byAdmin: Object.entries(admin)
        .map(([Admin, v]) => ({ Admin, Tickets: v.tickets, "Sales (₹)": Math.round(v.sales) }))
        .sort((a, b) => b["Sales (₹)"] - a["Sales (₹)"]),
      byDate: Object.values(date)
        .map((r) => ({ Date: r.Date, "Tickets Booked": r.Tickets, "Revenue (₹)": Math.round(r.Revenue), "GST (₹)": Math.round(r.GST) }))
        .sort((a, b) => a.Date.localeCompare(b.Date)),
      bookings: detail.sort((a, b) => String(b.Date).localeCompare(String(a.Date))),
      totals: {
        bookings: tickets.length,
        tickets: totalTickets,
        revenue: Math.round(totalRevenue),
        gst: Math.round(totalGst),
      },
    };
  }, [tickets]);

  const downloadExcel = () => {
    if (tickets.length === 0) return;
    const wb = XLSX.utils.book_new();
    const add = (name: string, rows: Row[]) => {
      if (rows.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), name);
    };
    add("Bookings", bookings);
    add("Date Wise", byDate);
    add("Per Slot", perSlot);
    add("Ticket Types", byType);
    add("Admin Sales", byAdmin);
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AD_Report_${selectedEvent || "All"}_${fmtDate(startDate)}_to_${fmtDate(endDate)}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const dpClass = "bg-[#1f1f1f] text-white px-3 py-2 rounded border border-[#96FF00]";

  const summaryCard = (label: string, value: string) => (
    <div className="bg-[#1c1c1c] border border-[#96FF00] rounded p-4">
      <p className="text-white/60 text-xs">{label}</p>
      <p className="text-2xl font-bold mt-1 text-white">{value}</p>
    </div>
  );

  return (
    <div className="p-6 bg-[#121212] min-h-screen text-white max-w-screen-xl mx-auto">
      <BackButton />
      <h1 className="text-2xl font-bold mb-6 text-white text-center">AD Dashboard</h1>

      {/* Filters Row */}
      <div className="flex justify-between items-end mb-6 flex-wrap gap-4">
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={(date: Date | null) => date && setStartDate(date)}
              className={dpClass}
              dateFormat="yyyy-MM-dd"
              maxDate={endDate}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <DatePicker
              selected={endDate}
              onChange={(date: Date | null) => date && setEndDate(date)}
              className={dpClass}
              dateFormat="yyyy-MM-dd"
              minDate={startDate}
              maxDate={new Date()}
            />
          </div>
        </div>

        <div className="flex items-end gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-white">Select Event</label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className={dpClass}
            >
              <option value="">All Events</option>
              {events.map((ev) => (
                <option key={ev.eventId} value={ev.eventId}>
                  {ev.location}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={downloadExcel}
            className="bg-[#96FF00] text-black font-semibold px-4 py-2 rounded hover:bg-lime-300 transition"
          >
            Download Excel
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading stats...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          {/* Summary totals */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-2">
            {summaryCard("Bookings", String(totals.bookings))}
            {summaryCard("Tickets Sold", String(totals.tickets))}
            {summaryCard("Revenue", `₹${totals.revenue}`)}
            {summaryCard("GST", `₹${totals.gst}`)}
          </div>

          <DataTable title="Date Wise Ticket Summary" rows={byDate} />
          <DataTable title="Tickets Booked Per Slot" rows={perSlot} />
          <DataTable title="Ticket Type Distribution" rows={byType} />
          <DataTable title="Admin-wise Booking Performance" rows={byAdmin} />
          <DataTable title="All Bookings" rows={bookings} />
        </>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AdminGuard allowedRoles={["Ops Admin", "Super Admin"]}>
      <Dashboard />
    </AdminGuard>
  );
}
