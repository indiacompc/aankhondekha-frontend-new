/**
 * Export field-visit / attendance records to an Excel file for a date range.
 *
 * 👉 CHANGE THE DATES BELOW, then run:  node scripts/export-fieldvisits.mjs
 */

// ====== EDIT THESE TWO DATES (format: YYYY-MM-DD) ======
const START_DATE = "2026-07-29";
const END_DATE   = "2026-07-30";
// =======================================================

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

// Use the dates from the top of this file (or override via CLI args if given).
const startDate = process.argv[2] || START_DATE;
const endDate = process.argv[3] || END_DATE;

async function main() {
  const snap = await db
    .collection("fieldVisits")
    .where("timestamp", ">=", `${startDate}T00:00:00`)
    .where("timestamp", "<=", `${endDate}T23:59:59`)
    .orderBy("timestamp", "desc")
    .get();

  const rows = snap.docs.map((d) => {
    const r = d.data();
    return {
      "Employee Name": r.employeeName || "",
      Mobile: r.employeeMobile || "",
      Category: r.category || "",
      "Date & Time": r.timestamp || "",
      Latitude: r.latitude ?? "",
      Longitude: r.longitude ?? "",
      "Location Link":
        r.latitude != null ? `https://www.google.com/maps?q=${r.latitude},${r.longitude}` : "",
      "Field Visit": r.isFieldVisit ? "Yes" : "No",
      "Customer Name": r.customerName || "",
      "Customer Address": r.customerAddress || "",
      Pincode: r.pincode || "",
      Notes: r.notes || "",
      "Photo URL": r.photoUrl || "",
    };
  });

  console.log(`Found ${rows.length} field-visit records from ${startDate} to ${endDate}.`);

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "FieldVisits");
  const out = join("d:/pratik/aankhondekha", `field_visits_${startDate}_to_${endDate}.xlsx`);
  XLSX.writeFile(wb, out);
  console.log("Saved:", out);
  process.exit(0);
}

main().catch((err) => {
  console.error("Export failed:", err);
  process.exit(1);
});
