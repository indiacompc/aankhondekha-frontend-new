/**
 * Bulk-generate booking slots for every event, for the next N days.
 * Idempotent: existing slots (by deterministic id) are preserved, so booked
 * seats stay intact. Mirrors the per-date generator used by the admin UI.
 *
 * Run:  node scripts/generate-slots.mjs        (default 60 days)
 *       node scripts/generate-slots.mjs 30
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// Slot patterns per event (must match src/lib/slots.ts).
const SLOT_PATTERNS = {
  "1": { startMin: 9 * 60, endMin: 22 * 60, intervalMin: 15, capacity: 6 },
  "3": { startMin: 12 * 60, endMin: 22 * 60, intervalMin: 15, capacity: 10 },
};

function findServiceAccount() {
  if (process.env.SERVICE_ACCOUNT) return process.env.SERVICE_ACCOUNT;
  const hit = readdirSync(root).find((f) => /firebase-adminsdk.*\.json$/.test(f));
  if (!hit) throw new Error("Service account key not found in project root.");
  return join(root, hit);
}

initializeApp({ credential: cert(JSON.parse(readFileSync(findServiceAccount(), "utf8"))) });
const db = getFirestore();

function fmtTime(minutes) {
  let h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2, "0")} ${ampm}`;
}

function isoDate(d) {
  return d.toLocaleDateString("en-CA"); // YYYY-MM-DD, local
}

async function main() {
  const days = parseInt(process.argv[2] || "60", 10);
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  // Build the full set of planned slots.
  const planned = [];
  for (let day = 0; day < days; day++) {
    const date = new Date(start);
    date.setDate(start.getDate() + day);
    const slotDate = isoDate(date);
    for (const [eventId, p] of Object.entries(SLOT_PATTERNS)) {
      for (let t = p.startMin; t < p.endMin; t += p.intervalMin) {
        planned.push({
          id: `${eventId}_${slotDate}_${t}`,
          data: {
            eventId,
            slotDate,
            slotTime: `${fmtTime(t)} - ${fmtTime(t + p.intervalMin)}`,
            maxCapacity: p.capacity,
            availableSeats: p.capacity,
          },
        });
      }
    }
  }

  // Skip ones that already exist (preserve booked seats). Query by eventId only
  // (single-field auto index) to avoid needing a composite index.
  const existing = new Set();
  const from = isoDate(start);
  for (const eventId of Object.keys(SLOT_PATTERNS)) {
    const snap = await db.collection("slots").where("eventId", "==", eventId).get();
    snap.forEach((d) => {
      if ((d.data().slotDate || "") >= from) existing.add(d.id);
    });
  }

  const toCreate = planned.filter((s) => !existing.has(s.id));
  console.log(
    `Planned ${planned.length} slots over ${days} days; ` +
      `${existing.size} already exist; creating ${toCreate.length}.`,
  );

  let done = 0;
  for (let i = 0; i < toCreate.length; i += 450) {
    const batch = db.batch();
    for (const s of toCreate.slice(i, i + 450)) {
      batch.set(db.collection("slots").doc(s.id), s.data);
    }
    await batch.commit();
    done += Math.min(450, toCreate.length - i);
    process.stdout.write(`\r  created ${done}/${toCreate.length}`);
  }
  process.stdout.write("\n");
  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error("\nSlot generation failed:", err);
  process.exit(1);
});
