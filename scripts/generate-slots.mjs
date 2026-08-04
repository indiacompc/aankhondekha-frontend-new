/**
 * Bulk-generate booking slots for every event, for the next N days.
 * Idempotent: existing slots (by deterministic id) are preserved, so booked
 * seats stay intact. Mirrors the per-date generator used by the admin UI.
 *
 * Slots left over from an older timing (or now falling on a closure day) are
 * reported as "stale". Pass --prune to delete the untouched ones; slots with
 * seats already sold are never deleted — they are listed so you can call those
 * customers first.
 *
 * Run:  node scripts/generate-slots.mjs           (default 60 days, report only)
 *       node scripts/generate-slots.mjs 30
 *       node scripts/generate-slots.mjs 60 --prune
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// Slot patterns per event (must match src/lib/slots.ts).
//   Orchha (1):        08:00–19:30, open every day
//   MPT Boat Club (3): 16:00–20:00, closed on the holidays in closures.json
const SLOT_PATTERNS = {
  "1": { startMin: 8 * 60, endMin: 19 * 60 + 30, intervalMin: 15, capacity: 6 },
  "3": { startMin: 16 * 60, endMin: 20 * 60, intervalMin: 15, capacity: 10 },
};

// Shared with the app: { eventId: { "YYYY-MM-DD": reason } }.
const CLOSURES = JSON.parse(
  readFileSync(join(root, "src", "lib", "closures.json"), "utf8"),
);
const isClosed = (eventId, slotDate) => Boolean(CLOSURES[eventId]?.[slotDate]);

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
  const argv = process.argv.slice(2);
  const prune = argv.includes("--prune");
  const days = parseInt(argv.find((a) => /^\d+$/.test(a)) || "60", 10);
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  // Build the full set of planned slots, skipping each event's closure dates.
  const planned = [];
  const skippedDays = {};
  for (let day = 0; day < days; day++) {
    const date = new Date(start);
    date.setDate(start.getDate() + day);
    const slotDate = isoDate(date);
    for (const [eventId, p] of Object.entries(SLOT_PATTERNS)) {
      if (isClosed(eventId, slotDate)) {
        skippedDays[eventId] = (skippedDays[eventId] || 0) + 1;
        continue;
      }
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
  const plannedIds = new Set(planned.map((s) => s.id));
  const from = isoDate(start);
  const windowEnd = new Date(start);
  windowEnd.setDate(start.getDate() + days - 1);
  const to = isoDate(windowEnd);

  const existing = new Set();
  const staleFree = []; // no seats sold — safe to delete
  const staleBooked = []; // seats sold — never deleted, only reported
  for (const eventId of Object.keys(SLOT_PATTERNS)) {
    const snap = await db.collection("slots").where("eventId", "==", eventId).get();
    snap.forEach((d) => {
      const s = d.data();
      const date = s.slotDate || "";
      if (date < from) return;
      existing.add(d.id);
      // Only judge staleness inside the window we just planned.
      if (date > to || plannedIds.has(d.id)) return;
      const sold = (s.maxCapacity ?? 0) - (s.availableSeats ?? 0);
      const entry = { id: d.id, eventId, date, time: s.slotTime, sold };
      (sold > 0 ? staleBooked : staleFree).push(entry);
    });
  }

  const toCreate = planned.filter((s) => !existing.has(s.id));
  console.log(
    `Planned ${planned.length} slots over ${days} days; ` +
      `${existing.size} already exist; creating ${toCreate.length}.`,
  );
  for (const [eventId, n] of Object.entries(skippedDays)) {
    console.log(`  event ${eventId}: skipped ${n} closure day(s).`);
  }

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
  if (toCreate.length) process.stdout.write("\n");

  // Stale = exists in the window but is no longer part of the pattern
  // (old timing, or the date is now a closure day).
  if (staleFree.length || staleBooked.length) {
    console.log(
      `\nStale slots in ${from}..${to}: ${staleFree.length} unbooked, ` +
        `${staleBooked.length} with seats already sold.`,
    );
    for (const s of staleBooked) {
      console.log(`  ⚠ KEPT (sold ${s.sold}): ${s.id}  ${s.date} ${s.time}`);
    }
    if (!prune) {
      console.log(`  Re-run with --prune to delete the ${staleFree.length} unbooked ones.`);
    } else {
      let removed = 0;
      for (let i = 0; i < staleFree.length; i += 450) {
        const batch = db.batch();
        for (const s of staleFree.slice(i, i + 450)) {
          batch.delete(db.collection("slots").doc(s.id));
        }
        await batch.commit();
        removed += Math.min(450, staleFree.length - i);
        process.stdout.write(`\r  deleted ${removed}/${staleFree.length}`);
      }
      if (staleFree.length) process.stdout.write("\n");
    }
  }

  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error("\nSlot generation failed:", err);
  process.exit(1);
});
