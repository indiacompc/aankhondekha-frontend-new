"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { ArrowLeft, Download } from "lucide-react";
import { toast } from "sonner";
import { AdminGuard } from "@/components/AdminGuard";
import {
  getTicketsByDateRange,
  getGiftTicketsByDateRange,
  getAllCustomers,
  getAllTicketTypes,
  getEvents,
} from "@/lib/db";

const inputClass =
  "px-3 py-2 bg-[#595959] text-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#96FF00] outline-none text-sm";

function daysAgoISO(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function download(sheets: Record<string, Record<string, unknown>[]>, file: string) {
  const wb = XLSX.utils.book_new();
  let any = false;
  for (const [name, rows] of Object.entries(sheets)) {
    if (!rows.length) continue;
    any = true;
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(rows),
      name.slice(0, 31),
    );
  }
  if (!any) {
    toast.error("No data in the selected range");
    return;
  }
  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file;
  a.click();
  URL.revokeObjectURL(url);
}

function Report() {
  const router = useRouter();
  const [start, setStart] = useState(daysAgoISO(30));
  const [end, setEnd] = useState(daysAgoISO(0));
  const [busy, setBusy] = useState<string | null>(null);

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    try {
      await fn();
    } catch (err) {
      console.error(err);
      toast.error("Export failed (a Firestore index may be building)");
    } finally {
      setBusy(null);
    }
  };

  const exportTickets = () =>
    run("tickets", async () => {
      const rows = await getTicketsByDateRange(start, end);
      download({ Tickets: rows as unknown as Record<string, unknown>[] }, `tickets_${start}_${end}.xlsx`);
    });

  const exportGifts = () =>
    run("gifts", async () => {
      const rows = await getGiftTicketsByDateRange(start, end);
      download({ GiftTickets: rows as unknown as Record<string, unknown>[] }, `gift_tickets_${start}_${end}.xlsx`);
    });

  const exportCustomers = () =>
    run("customers", async () => {
      const rows = await getAllCustomers();
      download({ Customers: rows }, `customers.xlsx`);
    });

  const exportAll = () =>
    run("all", async () => {
      const [tickets, gifts, customers, ticketTypes, events] = await Promise.all([
        getTicketsByDateRange(start, end),
        getGiftTicketsByDateRange(start, end),
        getAllCustomers(),
        getAllTicketTypes(),
        getEvents(),
      ]);
      download(
        {
          Tickets: tickets as unknown as Record<string, unknown>[],
          GiftTickets: gifts as unknown as Record<string, unknown>[],
          Customers: customers,
          TicketTypes: ticketTypes,
          Events: events as unknown as Record<string, unknown>[],
        },
        `report_${start}_${end}.xlsx`,
      );
    });

  const btn = (label: string, key: string, onClick: () => void) => (
    <button
      onClick={onClick}
      disabled={busy !== null}
      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#595959] hover:bg-[#666] text-white disabled:opacity-60"
    >
      <Download className="w-4 h-4" />
      {busy === key ? "Exporting…" : label}
    </button>
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
          <h1 className="ml-5 font-bold text-[24px] text-white">Reports</h1>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <input type="date" value={start} max={end} onChange={(e) => setStart(e.target.value)} className={inputClass} />
          <input type="date" value={end} min={start} onChange={(e) => setEnd(e.target.value)} className={inputClass} />
        </div>

        <div className="space-y-3">
          {btn("Download Everything (Excel)", "all", exportAll)}
          {btn("Tickets", "tickets", exportTickets)}
          {btn("Gift Tickets", "gifts", exportGifts)}
          {btn("Customers", "customers", exportCustomers)}
        </div>

        <p className="text-white/50 text-xs mt-6">
          Exports are generated from Firestore for the selected date range
          (tickets &amp; gift tickets by booking date; customers are all-time).
        </p>
      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <AdminGuard allowedRoles={["Ops Admin", "Super Admin"]}>
      <Report />
    </AdminGuard>
  );
}
