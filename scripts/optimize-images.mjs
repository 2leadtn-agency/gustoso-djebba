// Runs automatically before every build (see package.json "prebuild").
// Client photos get dropped into public/images/ by filename only, with no
// resizing/compression step of their own - this keeps every deploy fast
// regardless of what gets uploaded there.
import sharp from "sharp";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const IMAGES_DIR = path.resolve("public/images");

const HERO_MAX_WIDTH = 2400;
const BANNER_MAX_WIDTH = 2200;
const STANDARD_MAX_WIDTH = 1600;
const QUALITY = 78;

function maxWidthFor(filename) {
  if (filename.startsWith("hero-")) return HERO_MAX_WIDTH;
  if (filename.startsWith("bandeau-")) return BANNER_MAX_WIDTH;
  return STANDARD_MAX_WIDTH;
}

async function run() {
  let files;
  try {
    files = await readdir(IMAGES_DIR);
  } catch {
    console.log("[optimize-images] no public/images directory yet, skipping");
    return;
  }

  for (const file of files) {
    if (!/\.jpe?g$/i.test(file)) continue;
    const filePath = path.join(IMAGES_DIR, file);
    const before = (await stat(filePath)).size;
    const maxWidth = maxWidthFor(file);
    const source = await readFile(filePath);

    const buffer = await sharp(source)
      .rotate()
      .resize({ width: maxWidth, withoutEnlargement: true })
      .jpeg({ quality: QUALITY, progressive: true, mozjpeg: true })
      .toBuffer();

    // Only overwrite when there's a real win - avoids re-compressing an
    // already-optimized file a little more on every single build, which
    // would slowly degrade quality across repeated deploys.
    if (buffer.length < before * 0.9) {
      await writeFile(filePath, buffer);
      console.log(
        `[optimize-images] ${file}: ${(before / 1024).toFixed(0)}KB -> ${(buffer.length / 1024).toFixed(0)}KB`
      );
    } else {
      console.log(`[optimize-images] ${file}: already optimal (${(before / 1024).toFixed(0)}KB), skipped`);
    }
  }
}

run();
