/**
 * Import the legacy PostgreSQL data (exported to JSON by export_pg.py) into
 * Firestore + Firebase Auth. Uses the Admin SDK (bypasses security rules).
 *
 * What it writes:
 *   events/{eventId}         — real locations (overwrites seed labels)
 *   ticketTypes/{auto}       — cleared & re-created from real ticket types
 *   customers/{mobile}       — 2,470 customer profiles
 *   tickets/{ticketId}       — 3,314 historical bookings (slot time denormalized)
 *   giftTickets/{giftId}     — gift tickets
 *   fieldVisits/{auto}       — merged employee attendance + field visits
 *   admins/{uid} + Auth user — staff logins (email = <username>@aankhondekha.local)
 *
 * Slots are NOT imported (regenerated fresh via the slot generator).
 *
 * Run:  node scripts/import-legacy.mjs [path-to-import-data.json]
 *       node scripts/import-legacy.mjs --dry     (count only, no writes)
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const DRY = process.argv.includes("--dry");
const DATA_PATH =
  process.argv.find((a) => a.endsWith(".json")) ||
  "C:/Users/SD317/AppData/Local/Temp/claude/d--pratik-aankhondekha/f6852a4d-d2a2-4d09-a091-8d72c1dc76b1/scratchpad/import-data.json";
const ADMIN_EMAIL_DOMAIN = "aankhondekha.local";

function findServiceAccount() {
  if (process.env.SERVICE_ACCOUNT) return process.env.SERVICE_ACCOUNT;
  const hit = readdirSync(root).find((f) => /firebase-adminsdk.*\.json$/.test(f));
  if (!hit) throw new Error("Service account key not found in project root.");
  return join(root, hit);
}

const serviceAccount = JSON.parse(readFileSync(findServiceAccount(), "utf8"));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();
const auth = getAuth();

const data = JSON.parse(readFileSync(DATA_PATH, "utf8"));

/** Commit an array of {ref, data} in batches under Firestore's 500 limit. */
async function commitInBatches(writes, label) {
  if (DRY) {
    console.log(`  [dry] ${label}: would write ${writes.length}`);
    return;
  }
  let done = 0;
  for (let i = 0; i < writes.length; i += 450) {
    const batch = db.batch();
    for (const w of writes.slice(i, i + 450)) batch.set(w.ref, w.data);
    await batch.commit();
    done += Math.min(450, writes.length - i);
    process.stdout.write(`\r  ${label}: ${done}/${writes.length}`);
  }
  process.stdout.write("\n");
}

async function importEvents() {
  const writes = data.events.map((e) => ({
    ref: db.collection("events").doc(e._id),
    data: e.data,
  }));
  await commitInBatches(writes, "events");
}

async function importTicketTypes() {
  if (!DRY) {
    const existing = await db.collection("ticketTypes").get();
    const del = db.batch();
    existing.forEach((d) => del.delete(d.ref));
    await del.commit();
    console.log(`  cleared ${existing.size} existing ticketTypes`);
  }
  const writes = data.ticketTypes.map((t) => ({
    ref: db.collection("ticketTypes").doc(),
    data: t.data,
  }));
  await commitInBatches(writes, "ticketTypes");
}

async function importDocs(key, collection) {
  const writes = data[key].map((r) => ({
    ref: db.collection(collection).doc(r._id),
    data: r.data,
  }));
  await commitInBatches(writes, collection);
}

async function importFieldVisits() {
  const writes = data.fieldVisits.map((r) => ({
    ref: db.collection("fieldVisits").doc(),
    data: r.data,
  }));
  await commitInBatches(writes, "fieldVisits");
}

async function importAdmins() {
  let created = 0;
  let updated = 0;
  for (const a of data.admins) {
    const email = `${a.username.trim()}@${ADMIN_EMAIL_DOMAIN}`.toLowerCase();
    if (DRY) {
      console.log(`  [dry] admin ${email} (${a.role})`);
      continue;
    }
    let user;
    try {
      user = await auth.getUserByEmail(email);
      // keep existing password in sync with the legacy one
      if (a.password && a.password.length >= 6) {
        await auth.updateUser(user.uid, { password: a.password });
      }
      updated++;
    } catch {
      user = await auth.createUser({
        email,
        password: a.password && a.password.length >= 6 ? a.password : "Change@123",
        displayName: a.name,
      });
      created++;
    }
    await db.collection("admins").doc(user.uid).set({
      uid: user.uid,
      email,
      name: a.name,
      role: a.role,
      eventId: a.eventId ?? null,
      legacyUsername: a.username,
    });
  }
  console.log(`  admins: ${created} created, ${updated} updated`);
}

async function main() {
  console.log(`Importing from ${DATA_PATH}${DRY ? " (DRY RUN)" : ""}`);
  console.log(
    `Counts -> events:${data.events.length} ticketTypes:${data.ticketTypes.length} ` +
      `customers:${data.customers.length} tickets:${data.tickets.length} ` +
      `gifts:${data.giftTickets.length} fieldVisits:${data.fieldVisits.length} ` +
      `admins:${data.admins.length}`,
  );
  await importEvents();
  await importTicketTypes();
  await importDocs("customers", "customers");
  await importDocs("tickets", "tickets");
  await importDocs("giftTickets", "giftTickets");
  await importFieldVisits();
  await importAdmins();
  console.log("\nDone.");
  process.exit(0);
}

main().catch((err) => {
  console.error("\nImport failed:", err);
  process.exit(1);
});
