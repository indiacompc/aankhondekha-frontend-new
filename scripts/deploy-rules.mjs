/**
 * Publish firestore.rules to Firebase using the service account (no Firebase
 * CLI login needed). Uses the Security Rules REST API.
 *
 * Run:  node scripts/deploy-rules.mjs
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleAuth } from "google-auth-library";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const saFile =
  process.env.SERVICE_ACCOUNT ||
  join(root, readdirSync(root).find((f) => /firebase-adminsdk.*\.json$/.test(f)));
const sa = JSON.parse(readFileSync(saFile, "utf8"));
const project = sa.project_id;
const source = readFileSync(join(root, "firestore.rules"), "utf8");

const auth = new GoogleAuth({
  credentials: sa,
  scopes: ["https://www.googleapis.com/auth/cloud-platform"],
});

async function main() {
  const client = await auth.getClient();
  const { token } = await client.getAccessToken();
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const base = `https://firebaserules.googleapis.com/v1/projects/${project}`;

  // 1. Create a new ruleset from firestore.rules.
  const rsRes = await fetch(`${base}/rulesets`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      source: { files: [{ name: "firestore.rules", content: source }] },
    }),
  });
  const rsJson = await rsRes.json();
  if (!rsRes.ok) throw new Error(`Ruleset create failed: ${JSON.stringify(rsJson)}`);
  console.log("✓ ruleset created:", rsJson.name);

  // 2. Point the cloud.firestore release at the new ruleset (create or update).
  const releaseName = `projects/${project}/releases/cloud.firestore`;
  const body = JSON.stringify({ name: releaseName, rulesetName: rsJson.name });

  let relRes = await fetch(`${base}/releases`, { method: "POST", headers, body });
  if (relRes.status === 409) {
    // Already exists — update it instead.
    relRes = await fetch(`https://firebaserules.googleapis.com/v1/${releaseName}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ release: { name: releaseName, rulesetName: rsJson.name } }),
    });
  }
  const relJson = await relRes.json();
  if (!relRes.ok) throw new Error(`Release update failed: ${JSON.stringify(relJson)}`);
  console.log("✓ published to release: cloud.firestore");
  console.log("\nFirestore rules are now live.");
  process.exit(0);
}

main().catch((err) => {
  console.error("\nDeploy failed:", err.message);
  process.exit(1);
});
