/**
 * Delete specific events (locations) plus their ticket types and slots.
 *
 * Run:  node scripts/remove-locations.mjs 2 4      (removes Bhopal + Maheshwar)
 *       node scripts/remove-locations.mjs <eventId>...
 *
 * Uses the Admin SDK + service account key (git-ignored). Existing tickets /
 * gift tickets are left as historical records.
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function findServiceAccount() {
  if (process.env.SERVICE_ACCOUNT) return process.env.SERVICE_ACCOUNT;
  const hit = readdirSync(root).find((f) => /firebase-adminsdk.*\.json$/.test(f));
  if (!hit) throw new Error("Service account key not found in project root.");
  return join(root, hit);
}

const serviceAccount = JSON.parse(readFileSync(findServiceAccount(), "utf8"));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function deleteQuery(coll, field, ids) {
  const snap = await db
    .collection(coll)
    .where(field, "in", ids)
    .get();
  let n = 0;
  for (let i = 0; i < snap.docs.length; i += 450) {
    const batch = db.batch();
    for (const d of snap.docs.slice(i, i + 450)) batch.delete(d.ref);
    await batch.commit();
    n += Math.min(450, snap.docs.length - i);
  }
  return n;
}

async function main() {
  const ids = process.argv.slice(2);
  if (ids.length === 0) {
    console.error("Pass one or more eventIds, e.g. node scripts/remove-locations.mjs 2 4");
    process.exit(1);
  }

  const evBatch = db.batch();
  for (const id of ids) evBatch.delete(db.collection("events").doc(id));
  await evBatch.commit();
  console.log(`✓ events removed: ${ids.join(", ")}`);

  const tt = await deleteQuery("ticketTypes", "eventId", ids);
  console.log(`✓ ticketTypes removed: ${tt}`);

  const sl = await deleteQuery("slots", "eventId", ids);
  console.log(`✓ slots removed: ${sl}`);

  console.log("\nDone.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
