"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import * as XLSX from "xlsx";
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

/** Photo thumbnail; opens full image in a new tab, falls back if broken. */
function PhotoCell({ url, name }: { url: string; name: string }) {
  const [broken, setBroken] = useState(false);
  if (!url || broken) {
    return <span className="text-white/40 text-xs">No image</span>;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={name}
      onError={() => setBroken(true)}
      onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
      className="w-14 h-14 rounded object-cover cursor-pointer hover:scale-105 transition"
      title="Click to view full image"
    />
  );
}

function Attendance() {
  const router = useRouter();
  const [start, setStart] = useState(daysAgoISO(30));
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

  const downloadExcel = () => {
    if (rows.length === 0) return;
    const data = rows.map((r) => ({
      "Employee Name": r.employeeName,
      Mobile: r.employeeMobile,
      Category: r.category,
      "Date & Time": new Date(r.timestamp).toLocaleString(),
      Latitude: r.latitude,
      Longitude: r.longitude,
      "Location Link": `https://www.google.com/maps?q=${r.latitude},${r.longitude}`,
      "Field Visit": r.isFieldVisit ? "Yes" : "No",
      "Customer Name": r.customerName || "",
      "Customer Address": r.customerAddress || "",
      Pincode: r.pincode || "",
      Notes: r.notes || "",
      "Photo URL": r.photoUrl || "",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Attendance_${start}_to_${end}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#121212] p-6">
      <div className="max-w-screen-xl mx-auto">
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

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <input type="date" value={start} max={end} onChange={(e) => setStart(e.target.value)} className={inputClass} />
          <input type="date" value={end} min={start} onChange={(e) => setEnd(e.target.value)} className={inputClass} />
          <span className="text-white/60 text-sm self-center">
            {rows.length} record{rows.length === 1 ? "" : "s"}
          </span>
          <button
            onClick={downloadExcel}
            disabled={rows.length === 0}
            className="ml-auto bg-[#96FF00] text-black font-semibold px-4 py-2 rounded hover:bg-lime-300 transition disabled:opacity-50"
          >
            Download Excel
          </button>
        </div>

        {loading ? (
          <p className="text-white/70">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-white/60">No attendance records in this range.</p>
        ) : (
          <div className="bg-[#1c1c1c] border border-[#96FF00] rounded p-4 overflow-x-auto">
            <table className="min-w-full text-sm border border-[#2C410E] text-white">
              <thead className="bg-[#2C410E]">
                <tr>
                  {["Photo", "Employee", "Mobile", "Category", "Date & Time", "Location", "Field Visit", "Customer", "Address", "Pincode", "Notes"].map(
                    (col) => (
                      <th key={col} className="px-3 py-2 border-b border-[#4CAF50] text-left whitespace-nowrap">
                        {col}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-[#96FF00]/10 align-top">
                    <td className="px-3 py-2 border-b border-[#333]">
                      <PhotoCell url={r.photoUrl} name={r.employeeName} />
                    </td>
                    <td className="px-3 py-2 border-b border-[#333] whitespace-nowrap">{r.employeeName}</td>
                    <td className="px-3 py-2 border-b border-[#333] whitespace-nowrap">{r.employeeMobile}</td>
                    <td className="px-3 py-2 border-b border-[#333] whitespace-nowrap">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          r.category === "check-in"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : r.category === "check-out"
                              ? "bg-blue-500/20 text-blue-300"
                              : "bg-amber-500/20 text-amber-300"
                        }`}
                      >
                        {r.category}
                      </span>
                    </td>
                    <td className="px-3 py-2 border-b border-[#333] whitespace-nowrap">
                      {new Date(r.timestamp).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 border-b border-[#333] whitespace-nowrap">
                      <a
                        href={`https://www.google.com/maps?q=${r.latitude},${r.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#96FF00] hover:underline"
                      >
                        View map
                      </a>
                    </td>
                    <td className="px-3 py-2 border-b border-[#333] whitespace-nowrap">{r.isFieldVisit ? "Yes" : "No"}</td>
                    <td className="px-3 py-2 border-b border-[#333] whitespace-nowrap">{r.customerName || "-"}</td>
                    <td className="px-3 py-2 border-b border-[#333] max-w-[220px] truncate" title={r.customerAddress}>
                      {r.customerAddress || "-"}
                    </td>
                    <td className="px-3 py-2 border-b border-[#333] whitespace-nowrap">{r.pincode || "-"}</td>
                    <td className="px-3 py-2 border-b border-[#333] max-w-[200px] truncate" title={r.notes}>
                      {r.notes || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
