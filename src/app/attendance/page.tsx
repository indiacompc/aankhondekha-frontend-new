"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { toast } from "sonner";
import { AdminGuard } from "@/components/AdminGuard";
import { getFieldVisitsByDateRange } from "@/lib/db";
import type { FieldVisit } from "@/lib/types";

const inputClass =
  "px-3 py-2 bg-[#595959] text-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#96FF00] outline-none text-sm";

function daysAgoISO(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function Attendance() {
  const router = useRouter();
  const [start, setStart] = useState(daysAgoISO(6));
  const [end, setEnd] = useState(daysAgoISO(0));
  const [rows, setRows] = useState<FieldVisit[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useMemo(
    () => async () => {
      setLoading(true);
      try {
        setRows(await getFieldVisitsByDateRange(start, end));
      } catch (err) {
        console.error(err);
        toast.error("Could not load attendance");
      } finally {
        setLoading(false);
      }
    },
    [start, end],
  );

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-screen bg-[#121212] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-md"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="ml-5 font-bold text-[24px] text-white">Attendance</h1>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <input type="date" value={start} max={end} onChange={(e) => setStart(e.target.value)} className={inputClass} />
          <input type="date" value={end} min={start} onChange={(e) => setEnd(e.target.value)} className={inputClass} />
          <span className="text-white/60 text-sm self-center">
            {rows.length} record{rows.length === 1 ? "" : "s"}
          </span>
        </div>

        {loading ? (
          <p className="text-white/70">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-white/60">No attendance records in this range.</p>
        ) : (
          <div className="space-y-3">
            {rows.map((r) => (
              <div
                key={r.id}
                className="bg-[#595959] rounded-xl p-4 text-white flex gap-4"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={r.photoUrl}
                  alt={r.employeeName}
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold truncate">{r.employeeName}</p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        r.category === "check-in"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-blue-500/20 text-blue-300"
                      }`}
                    >
                      {r.category}
                    </span>
                  </div>
                  <p className="text-white/60 text-xs">{r.employeeMobile}</p>
                  <p className="text-white/60 text-xs">
                    {new Date(r.timestamp).toLocaleString()}
                  </p>
                  <a
                    href={`https://www.google.com/maps?q=${r.latitude},${r.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#96FF00] text-xs mt-1 hover:underline"
                  >
                    <MapPin className="w-3.5 h-3.5" /> View location
                  </a>

                  {r.isFieldVisit && (
                    <div className="mt-2 text-xs bg-[#1c1c1c] rounded-lg p-2">
                      <p className="text-white/80 font-medium">
                        Field visit: {r.customerName}
                      </p>
                      <p className="text-white/60">
                        {r.customerAddress} — {r.pincode}
                      </p>
                      {r.notes && <p className="text-white/50 mt-1">{r.notes}</p>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AttendancePage() {
  return (
    <AdminGuard allowedRoles={["Ops Admin", "Super Admin"]}>
      <Attendance />
    </AdminGuard>
  );
}
