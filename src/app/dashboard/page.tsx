"use client";

import { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from "xlsx";
import {
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  BarChart,
  LabelList,
  Bar,
} from "recharts";
import BackButton from "@/components/BackButton";
import { AdminGuard } from "@/components/AdminGuard";
import { getEvents, getTicketsByDateRange } from "@/lib/db";
import type { EventDoc, Ticket } from "@/lib/types";

const PIE_COLORS = [
  "#96FF00",
  "#2C410E",
  "#4CAF50",
  "#1F1F1F",
  "#00C49F",
  "#66BB6A",
];

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
        const filtered = selectedEvent
          ? all.filter((t) => t.eventId === selectedEvent)
          : all;
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

  const { slotSummary, ticketTypeData, adminSales, ticketStats } = useMemo(() => {
    const bySlot: Record<string, number> = {};
    const byType: Record<string, number> = {};
    const byAdmin: Record<string, { tickets: number; sales: number }> = {};
    const byDate: Record<
      string,
      { Date: string; "Tickets Booked": number; "Revenue (₹)": number; "GST (₹)": number }
    > = {};

    for (const t of tickets) {
      const qty = (t.quantity || 0) + (t.complimentaryTicket || 0);
      bySlot[t.slotTime] = (bySlot[t.slotTime] || 0) + qty;
      byType[t.typeName] = (byType[t.typeName] || 0) + qty;

      const aLabel = adminLabel(t.adminId);
      byAdmin[aLabel] = byAdmin[aLabel] || { tickets: 0, sales: 0 };
      byAdmin[aLabel].tickets += qty;
      byAdmin[aLabel].sales += t.totalAmount || 0;

      const d = t.bookingDate;
      byDate[d] = byDate[d] || { Date: d, "Tickets Booked": 0, "Revenue (₹)": 0, "GST (₹)": 0 };
      byDate[d]["Tickets Booked"] += qty;
      byDate[d]["Revenue (₹)"] += t.totalAmount || 0;
      byDate[d]["GST (₹)"] += t.gstAmount || 0;
    }

    return {
      slotSummary: Object.entries(bySlot)
        .map(([slot_time, tickets_booked]) => ({ slot_time, tickets_booked }))
        .sort((a, b) => startMinutes(a.slot_time) - startMinutes(b.slot_time)),
      ticketTypeData: Object.entries(byType).map(([type_name, total_booked]) => ({
        type_name,
        total_booked,
      })),
      adminSales: Object.entries(byAdmin)
        .map(([name, v]) => ({ name, tickets: v.tickets, sales: Math.round(v.sales) }))
        .sort((a, b) => b.sales - a.sales),
      ticketStats: Object.values(byDate)
        .map((r) => ({
          ...r,
          "Revenue (₹)": Math.round(r["Revenue (₹)"]),
          "GST (₹)": Math.round(r["GST (₹)"]),
        }))
        .sort((a, b) => a.Date.localeCompare(b.Date)),
    };
  }, [tickets]);

  const exportTableToExcel = () => {
    if (ticketStats.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(ticketStats);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "TicketStats");
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
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
      </div>

      {/* Tickets Booked Per Slot */}
      <div className="mt-10 bg-[#1c1c1c] p-4 rounded border border-[#96FF00]">
        <h2 className="text-lg font-semibold mb-4 text-white">Tickets Booked Per Slot</h2>
        {loading ? (
          <p className="text-gray-400">Loading stats...</p>
        ) : slotSummary.length === 0 ? (
          <p className="text-gray-400">No data available</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={slotSummary} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBooked" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#96FF00" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#96FF00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="slot_time"
                tick={{ fill: "#ccc", fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fill: "#ccc" }} />
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="tickets_booked"
                stroke="#96FF00"
                fillOpacity={1}
                fill="url(#colorBooked)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Two charts side by side */}
      <div className="flex flex-wrap justify-start mt-10 gap-5">
        <div className="bg-[#1c1c1c] border border-[#96FF00] rounded p-4 w-[600px] max-w-full">
          <h2 className="text-lg font-semibold mb-4 text-white text-center">
            Ticket Type Distribution
          </h2>
          {ticketTypeData.length === 0 ? (
            <p className="text-gray-400 text-center">No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ticketTypeData.map((item, index) => ({
                    name: item.type_name,
                    value: item.total_booked,
                    fill: PIE_COLORS[index % PIE_COLORS.length],
                  }))}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label={({ name, value, cx, cy, midAngle, outerRadius }: any) => {
                    const RADIAN = Math.PI / 180;
                    const radius = outerRadius + 20;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    return (
                      <text
                        x={x}
                        y={y}
                        fill="#96FF00"
                        textAnchor={x > cx ? "start" : "end"}
                        dominantBaseline="central"
                        fontSize={12}
                        fontWeight="bold"
                      >
                        {`${name}: ${value}`}
                      </text>
                    );
                  }}
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Admin Sales Bar Chart */}
        <div className="bg-[#1c1c1c] border border-[#96FF00] rounded p-4 w-[600px] max-w-full">
          <h2 className="text-lg font-semibold mb-4 text-white text-center">
            Admin-wise Booking Performance
          </h2>
          {adminSales.length === 0 ? (
            <p className="text-gray-400 text-center">No sales data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={adminSales} layout="vertical" margin={{ top: 20, right: 40, left: 60, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" />
                <Tooltip
                  formatter={(value: any, name: any) => {
                    if (name === "sales") return [`₹${value}`, "Total Sales"];
                    if (name === "tickets") return [`${value} tickets`, "Total Tickets"];
                    return value;
                  }}
                />
                <Bar dataKey="sales" fill="#4CAF50">
                  <LabelList dataKey="sales" position="right" formatter={(val: any) => `₹${val}`} className="fill-white text-sm" />
                  <LabelList dataKey="tickets" position="insideLeft" formatter={(val: any) => `${val} tickets`} className="fill-white text-xs" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Download Excel */}
      <div className="flex justify-end mb-4 mt-4">
        <button
          onClick={exportTableToExcel}
          className="bg-[#96FF00] text-black font-semibold px-4 py-2 rounded hover:bg-lime-300 transition"
        >
          Download Excel
        </button>
      </div>

      {/* Date Wise Ticket Summary */}
      <div className="bg-[#1c1c1c] border border-[#96FF00] rounded p-4 overflow-x-auto">
        <h2 className="text-lg font-semibold mb-4">Date Wise Ticket Summary</h2>
        {loading ? (
          <p className="text-gray-400">Loading stats...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : ticketStats.length === 0 ? (
          <p className="text-gray-400">No data available for selected range.</p>
        ) : (
          <table className="min-w-full text-sm border border-[#2C410E] text-white">
            <thead className="bg-[#2C410E]">
              <tr>
                {Object.keys(ticketStats[0]).map((col) => (
                  <th key={col} className="px-4 py-2 border-b border-[#4CAF50] text-left">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ticketStats.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#96FF00]/10">
                  {Object.keys(row).map((col) => (
                    <td key={col} className="px-4 py-2 border-b border-[#333]">
                      {String(row[col as keyof typeof row])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
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
