"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AdminGuard } from "@/components/AdminGuard";
import { getEvents, getTicketsByDateRange } from "@/lib/db";
import type { EventDoc, Ticket } from "@/lib/types";

const inputClass =
  "px-3 py-2 bg-[#595959] text-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#96FF00] outline-none text-sm";

const PIE_COLORS = ["#96FF00", "#99160B", "#22d3ee", "#f59e0b", "#a78bfa"];

function daysAgoISO(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function Dashboard() {
  const router = useRouter();
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [eventId, setEventId] = useState("all");
  const [start, setStart] = useState(daysAgoISO(6));
  const [end, setEnd] = useState(daysAgoISO(0));
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getEvents().then(setEvents).catch(() => {});
  }, []);

  const load = useMemo(
    () => async () => {
      setLoading(true);
      try {
        const all = await getTicketsByDateRange(start, end);
        setTickets(eventId === "all" ? all : all.filter((t) => t.eventId === eventId));
      } catch (err) {
        console.error(err);
        toast.error("Could not load report (a Firestore index may be building)");
      } finally {
        setLoading(false);
      }
    },
    [start, end, eventId],
  );

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const totalBookings = tickets.length;
    let ticketsSold = 0;
    let revenue = 0;
    let gst = 0;
    const byDay: Record<string, number> = {};
    const byType: Record<string, number> = {};
    const byPayment: Record<string, number> = {};

    for (const t of tickets) {
      ticketsSold += t.quantity + (t.complimentaryTicket || 0);
      revenue += t.totalAmount || 0;
      gst += t.gstAmount || 0;
      byDay[t.bookingDate] = (byDay[t.bookingDate] || 0) + (t.totalAmount || 0);
      byType[t.typeName] = (byType[t.typeName] || 0) + t.quantity + (t.complimentaryTicket || 0);
      byPayment[t.paymentOption] = (byPayment[t.paymentOption] || 0) + (t.totalAmount || 0);
    }

    return {
      totalBookings,
      ticketsSold,
      revenue: Math.round(revenue),
      net: Math.round(revenue - gst),
      revenueByDay: Object.entries(byDay)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, amount]) => ({ date: date.slice(5), amount: Math.round(amount) })),
      ticketsByType: Object.entries(byType).map(([name, value]) => ({ name, value })),
      byPayment: Object.entries(byPayment).map(([k, v]) => ({ k, v: Math.round(v) })),
    };
  }, [tickets]);

  const card = (label: string, value: string) => (
    <div className="bg-[#595959] rounded-xl p-4 text-white">
      <p className="text-white/60 text-xs">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#121212] p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-md"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="ml-5 font-bold text-[24px] text-white">Dashboard</h1>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input type="date" value={start} max={end} onChange={(e) => setStart(e.target.value)} className={inputClass} />
          <input type="date" value={end} min={start} onChange={(e) => setEnd(e.target.value)} className={inputClass} />
          <select value={eventId} onChange={(e) => setEventId(e.target.value)} className={inputClass}>
            <option value="all" className="text-black">All locations</option>
            {events.map((e) => (
              <option key={e.eventId} value={e.eventId} className="text-black">
                {e.location}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-white/70">Loading…</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {card("Bookings", String(stats.totalBookings))}
              {card("Tickets sold", String(stats.ticketsSold))}
              {card("Revenue", `₹${stats.revenue}`)}
              {card("Net (ex-GST)", `₹${stats.net}`)}
            </div>

            {tickets.length === 0 ? (
              <p className="text-white/60">No bookings in this range.</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#595959] rounded-xl p-4">
                  <p className="text-white text-sm font-semibold mb-3">Revenue by day</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={stats.revenueByDay}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis dataKey="date" stroke="#ffffff80" fontSize={11} />
                      <YAxis stroke="#ffffff80" fontSize={11} />
                      <Tooltip contentStyle={{ background: "#1c1c1c", border: "none", color: "#fff" }} />
                      <Bar dataKey="amount" fill="#96FF00" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-[#595959] rounded-xl p-4">
                  <p className="text-white text-sm font-semibold mb-3">Tickets by type</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={stats.ticketsByType} dataKey="value" nameKey="name" outerRadius={80} label>
                        {stats.ticketsByType.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#1c1c1c", border: "none", color: "#fff" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-[#595959] rounded-xl p-4 lg:col-span-2">
                  <p className="text-white text-sm font-semibold mb-3">By payment method</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {stats.byPayment.map((p) => (
                      <div key={p.k} className="text-white">
                        <p className="text-white/60 text-xs capitalize">{p.k}</p>
                        <p className="font-bold">₹{p.v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
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
