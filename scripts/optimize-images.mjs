/**
 * Shrink oversized images in public/ (resize to a sane max width + recompress)
 * so the deployed site loads less. Overwrites in place only when the result is
 * smaller. Skips the git-ignored heavy media folders.
 *
 * Run:  node scripts/optimize-images.mjs
 */
import { readdirSync, statSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

const SKIP_DIRS = new Set(["videos", "vid", "dash", "data", "Store", "backgrounds"]);
const MIN_BYTES = 250 * 1024; // only touch files larger than 250 KB
const MAX_WIDTH = 1920;
const exts = new Set([".jpg", ".jpeg", ".png"]);

function* walk(dir, depth = 0) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (depth === 0 && SKIP_DIRS.has(name)) continue;
      yield* walk(full, depth + 1);
    } else {
      yield { full, size: st.size };
    }
  }
}

let savedBytes = 0;
let changed = 0;

for (const { full, size } of walk(publicDir)) {
  const ext = extname(full).toLowerCase();
  if (!exts.has(ext) || size < MIN_BYTES) continue;

  try {
    const input = readFileSync(full);
    const img = sharp(input, { failOn: "none" });
    const meta = await img.metadata();
    let pipeline = img.rotate();
    if (meta.width && meta.width > MAX_WIDTH) {
      pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
    }
    pipeline =
      ext === ".png"
        ? pipeline.png({ compressionLevel: 9, effort: 8, quality: 80 })
        : pipeline.jpeg({ quality: 72, mozjpeg: true });

    const output = await pipeline.toBuffer();
    if (output.length < size) {
      writeFileSync(full, output);
      savedBytes += size - output.length;
      changed++;
      const rel = full.replace(publicDir, "").replace(/\\/g, "/");
      console.log(
        `${rel}  ${(size / 1024 / 1024).toFixed(1)}MB -> ${(output.length / 1024 / 1024).toFixed(1)}MB`,
      );
    }
  } catch (err) {
    console.warn(`! skip ${full}: ${err.message}`);
  }
}

console.log(
  `\n✓ optimized ${changed} images, saved ${(savedBytes / 1024 / 1024).toFixed(1)} MB`,
);
