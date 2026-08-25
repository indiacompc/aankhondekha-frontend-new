/**
 * Export tickets joined with the booking customer's profile to an Excel file.
 *
 * Tickets join to customers on `uid` (customers/{uid}). Legacy and admin-booked
 * tickets carry the bare mobile number as the uid and have a matching
 * mobile-keyed customer doc, so the same key covers both old and app bookings.
 *
 * Run:  node scripts/export-tickets.mjs                        (all tickets)
 *       node scripts/export-tickets.mjs 2026-08-01 2026-08-14  (date range, by bookingDate)
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as XLSX from "xlsx";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function findServiceAccount() {
  if (process.env.SERVICE_ACCOUNT) return process.env.SERVICE_ACCOUNT;
  const hit = readdirSync(root).find((f) => /firebase-adminsdk.*\.json$/.test(f));
  if (!hit) throw new Error("Service account key not found in project root.");
  return join(root, hit);
}

initializeApp({ credential: cert(JSON.parse(readFileSync(findServiceAccount(), "utf8"))) });
const db = getFirestore();

const startDate = process.argv[2] || null;
const endDate = process.argv[3] || null;

/** Firestore Timestamp -> "YYYY-MM-DD HH:mm:ss" IST, or "" when absent. */
function fmtTimestamp(ts) {
  if (!ts) return "";
  if (typeof ts === "string") return ts;
  const secs = ts._seconds ?? ts.seconds;
  if (secs == null) return "";
  return new Date(secs * 1000)
    .toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" })
    .replace("T", " ");
}

async function main() {
  const customers = new Map();
  (await db.collection("customers").get()).forEach((d) => customers.set(d.id, d.data()));

  let q = db.collection("tickets");
  if (startDate) q = q.where("bookingDate", ">=", startDate);
  if (endDate) q = q.where("bookingDate", "<=", endDate);
  const snap = await q.get();

  let unmatched = 0;
  const rows = snap.docs
    .map((d) => {
      const t = d.data();
      const c = customers.get(t.uid);
      if (!c) unmatched++;
      return {
        "Ticket ID": d.id,
        "Booking Date": t.bookingDate || "",
        "Booked At": t.createdAt || "",
        Location: t.location || "",
        "Ticket Type": t.typeName || "",
        "Slot Date": t.slotDate || "",
        "Slot Time": t.slotTime || "",
        Quantity: t.quantity ?? "",
        Complimentary: t.complimentaryTicket ?? 0,
        "Total Amount": t.totalAmount ?? "",
        "GST Amount": t.gstAmount ?? "",
        "Payment Option": t.paymentOption || "",
        "Payment Status": t.paymentStatus || "",
        Status: t.isValid ? "Valid" : "Used / Checked-in",
        "Booked By Admin": t.adminId || "",
        // --- customer profile ---
        "Customer Name": c?.name || t.customerName || "",
        Mobile: t.mobile || c?.mobile || "",
        Email: c?.email || "",
        Gender: c?.gender || "",
        "Age Group": c?.ageGroup || "",
        "Registered On": fmtTimestamp(c?.createdAt),
        UID: t.uid || "",
      };
    })
    .sort((a, b) => String(b["Booking Date"]).localeCompare(String(a["Booking Date"])));

  const range = startDate || endDate ? `${startDate || "start"} to ${endDate || "end"}` : "all dates";
  const revenue = rows.reduce((s, r) => s + (Number(r["Total Amount"]) || 0), 0);
  console.log(`Found ${rows.length} tickets (${range}); total ₹${revenue.toLocaleString("en-IN")}.`);
  if (unmatched) console.log(`  ⚠ ${unmatched} ticket(s) had no matching customer record.`);

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Tickets");
  const suffix = startDate || endDate ? `${startDate || "start"}_to_${endDate || "end"}` : "all";
  const out = join("d:/pratik/aankhondekha", `tickets_${suffix}.xlsx`);
  XLSX.writeFile(wb, out);
  console.log("Saved:", out);
  process.exit(0);
}

main().catch((err) => {
  console.error("Export failed:", err);
  process.exit(1);
});
