/**
 * Seed Firestore with events, ticket types, slots, and a first Super Admin.
 *
 * Uses the Firebase Admin SDK with your service account key (so it bypasses
 * security rules — safe, runs locally only). The key file is git-ignored.
 *
 * Run:  node scripts/seed.mjs            (seeds 14 days of slots from today)
 *       node scripts/seed.mjs 30         (seeds 30 days of slots)
 *
 * Set SERVICE_ACCOUNT=path/to/key.json to point at a specific key; otherwise
 * the script auto-detects the *firebase-adminsdk*.json file in the project root.
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function findServiceAccount() {
  if (process.env.SERVICE_ACCOUNT) return process.env.SERVICE_ACCOUNT;
  const hit = readdirSync(root).find((f) => /firebase-adminsdk.*\.json$/.test(f));
  if (!hit) {
    throw new Error(
      "Service account key not found. Put the *firebase-adminsdk*.json file in the project root or set SERVICE_ACCOUNT.",
    );
  }
  return join(root, hit);
}

const serviceAccount = JSON.parse(readFileSync(findServiceAccount(), "utf8"));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();
const auth = getAuth();

/* --------------------------- reference data --------------------------- */

const EVENTS = [
  { eventId: "1", location: "Orchha" },
  { eventId: "3", location: "Wind & Waves - State Museum" },
];

// Sample ticket types per event. `price` is the FINAL, GST-inclusive price the
// customer pays. `originalPrice` is the struck-through MRP used to show the
// discount. Edit these to your real prices.
const TICKET_TYPES = [
  { typeName: "Immersive VR", eventId: "1", durationMinutes: 10, price: 99, originalPrice: 220, description: "of pure VR experience", offer: "GROUP OFFER Buy 4, Get 1 FREE!", note: "Offer Valid Till 31st May! Hurry Up!" },
  { typeName: "Immersive VR", eventId: "3", durationMinutes: 10, price: 129, originalPrice: 220, description: "water-sports VR experience" },
];

// Slot generation patterns per event.
const SLOT_PATTERNS = {
  1: { startMin: 9 * 60, endMin: 22 * 60, intervalMin: 15, capacity: 6 },
  3: { startMin: 9 * 60, endMin: 22 * 60, intervalMin: 15, capacity: 10 },
};

const SUPER_ADMIN = {
  email: process.env.SEED_ADMIN_EMAIL || "admin@aankhondekha.com",
  password: process.env.SEED_ADMIN_PASSWORD || "Admin@12345",
  name: "Super Admin",
  role: "Super Admin",
};

/* ------------------------------- helpers ------------------------------- */

function fmtTime(minutes) {
  let h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2, "0")} ${ampm}`;
}

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

async function commitInBatches(writes) {
  for (let i = 0; i < writes.length; i += 450) {
    const batch = db.batch();
    for (const w of writes.slice(i, i + 450)) batch.set(w.ref, w.data);
    await batch.commit();
  }
}

/* -------------------------------- seed -------------------------------- */

async function seedEvents() {
  const batch = db.batch();
  for (const e of EVENTS) batch.set(db.collection("events").doc(e.eventId), e);
  await batch.commit();
  console.log(`✓ events: ${EVENTS.length}`);
}

async function seedTicketTypes() {
  // Clear existing to keep the seed idempotent.
  const existing = await db.collection("ticketTypes").get();
  const del = db.batch();
  existing.forEach((d) => del.delete(d.ref));
  await del.commit();

  const batch = db.batch();
  for (const t of TICKET_TYPES) batch.set(db.collection("ticketTypes").doc(), t);
  await batch.commit();
  console.log(`✓ ticketTypes: ${TICKET_TYPES.length}`);
}

async function seedSlots(days) {
  const writes = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  for (let day = 0; day < days; day++) {
    const date = new Date(start);
    date.setDate(start.getDate() + day);
    const slotDate = isoDate(date);

    for (const [eventId, p] of Object.entries(SLOT_PATTERNS)) {
      for (let t = p.startMin; t < p.endMin; t += p.intervalMin) {
        const slotTime = `${fmtTime(t)} - ${fmtTime(t + p.intervalMin)}`;
        const id = `${eventId}_${slotDate}_${t}`;
        writes.push({
          ref: db.collection("slots").doc(id),
          data: {
            eventId,
            slotDate,
            slotTime,
            maxCapacity: p.capacity,
            availableSeats: p.capacity,
          },
        });
      }
    }
  }
  await commitInBatches(writes);
  console.log(`✓ slots: ${writes.length} (${days} days)`);
}

async function seedSuperAdmin() {
  let user;
  try {
    user = await auth.getUserByEmail(SUPER_ADMIN.email);
  } catch {
    user = await auth.createUser({
      email: SUPER_ADMIN.email,
      password: SUPER_ADMIN.password,
      displayName: SUPER_ADMIN.name,
    });
  }
  await db.collection("admins").doc(user.uid).set({
    uid: user.uid,
    email: SUPER_ADMIN.email,
    name: SUPER_ADMIN.name,
    role: SUPER_ADMIN.role,
    eventId: null,
  });
  console.log(`✓ super admin: ${SUPER_ADMIN.email} / ${SUPER_ADMIN.password}`);
}

async function main() {
  const days = parseInt(process.argv[2] || "14", 10);
  await seedEvents();
  await seedTicketTypes();
  await seedSlots(days);
  await seedSuperAdmin();
  console.log("\nDone. Super admin login above — change the password after first login.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
