import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";

const ROOT_DIR = process.cwd();
const PUBLIC_DIR = path.join(ROOT_DIR, "public");
const CACHE_FILE = path.join(ROOT_DIR, ".asset-cache.json");

let cache = {};
if (fs.existsSync(CACHE_FILE)) {
  try {
    cache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
  } catch {
    cache = {};
  }
}

function getFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash("md5").update(fileBuffer).digest("hex");
}

function saveCache() {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), "utf-8");
}

async function optimizeImage(inputPath, outputPath, options = {}) {
  const { maxWidth = 2048, maxHeight = 2048, quality = 90 } = options;
  if (fs.existsSync(outputPath)) {
    const inStat = fs.statSync(inputPath);
    const outStat = fs.statSync(outputPath);
    if (outStat.mtimeMs >= inStat.mtimeMs) {
      return false; // Output already exists and is newer than source
    }
  }

  const hash = getFileHash(inputPath);
  const cacheKey = `${inputPath}->${outputPath}`;

  if (cache[cacheKey] === hash && fs.existsSync(outputPath)) {
    return false;
  }

  const inputBuffer = fs.readFileSync(inputPath);
  const webpBuffer = await sharp(inputBuffer)
    .resize({ width: maxWidth, height: maxHeight, fit: "inside", withoutEnlargement: true })
    .webp({ quality, effort: 6 })
    .toBuffer();

  fs.writeFileSync(outputPath, webpBuffer);
  cache[cacheKey] = hash;

  const origSizeMB = (inputBuffer.length / (1024 * 1024)).toFixed(2);
  const optSizeMB = (webpBuffer.length / (1024 * 1024)).toFixed(2);
  console.log(`✓ [Image] ${path.relative(ROOT_DIR, inputPath)} -> ${path.relative(ROOT_DIR, outputPath)} (${origSizeMB} MB -> ${optSizeMB} MB)`);
  return true;
}

async function optimizeGlb(glbPath, options = {}) {
  const { maxTextureSize = 2048, quality = 88 } = options;
  const hash = getFileHash(glbPath);
  const cacheKey = `glb:${glbPath}`;

  if (cache[cacheKey] === hash) {
    return false;
  }

  const origBuffer = fs.readFileSync(glbPath);
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  const document = await io.read(glbPath);
  let modified = false;

  for (const texture of document.getRoot().listTextures()) {
    const origImage = texture.getImage();
    if (!origImage) continue;

    const meta = await sharp(origImage).metadata();
    const needsResize = meta.width > maxTextureSize || meta.height > maxTextureSize;
    const needsWebp = texture.getMimeType() !== "image/webp";

    if (needsResize || needsWebp) {
      const resizedWebp = await sharp(origImage)
        .resize({ width: maxTextureSize, height: maxTextureSize, fit: "inside", withoutEnlargement: true })
        .webp({ quality, effort: 6 })
        .toBuffer();

      texture.setImage(resizedWebp);
      texture.setMimeType("image/webp");
      modified = true;
    }
  }

  if (modified) {
    const optimizedBuffer = await io.writeBinary(document);
    fs.writeFileSync(glbPath, optimizedBuffer);
    const origMB = (origBuffer.length / (1024 * 1024)).toFixed(2);
    const optMB = (optimizedBuffer.length / (1024 * 1024)).toFixed(2);
    console.log(`✓ [3D Model] ${path.relative(ROOT_DIR, glbPath)} (${origMB} MB -> ${optMB} MB)`);
  }

  cache[cacheKey] = getFileHash(glbPath);
  return true;
}

async function runAutoOptimizer() {
  console.log("🚀 Starting Automatic Asset Optimization Pipeline...");

  if (fs.existsSync(PUBLIC_DIR)) {
    const publicFiles = fs.readdirSync(PUBLIC_DIR);
    for (const file of publicFiles) {
      if (file.endsWith(".glb")) {
        const glbPath = path.join(PUBLIC_DIR, file);
        await optimizeGlb(glbPath);
      }
    }
  }

  const kasetDir = path.join(PUBLIC_DIR, "kaset");
  if (fs.existsSync(kasetDir)) {
    const kasetFiles = fs.readdirSync(kasetDir);
    for (const file of kasetFiles) {
      if (file.match(/\.(png|jpe?g)$/i)) {
        const inputPath = path.join(kasetDir, file);
        const outputPath = path.join(kasetDir, file.replace(/\.(png|jpe?g)$/i, ".webp"));
        await optimizeImage(inputPath, outputPath, { maxWidth: 1400, quality: 90 });
      }
    }
  }

  const stickerDir = path.join(PUBLIC_DIR, "sticker");
  if (fs.existsSync(stickerDir)) {
    const stickerFiles = fs.readdirSync(stickerDir);
    for (const file of stickerFiles) {
      if (file.match(/\.(png|jpe?g)$/i)) {
        const inputPath = path.join(stickerDir, file);
        const outputPath = path.join(stickerDir, file.replace(/\.(png|jpe?g)$/i, ".webp"));
        await optimizeImage(inputPath, outputPath, { maxWidth: 800, quality: 90 });
      }
    }
  }

  const rootTextures = [
    "broken_glass_png_20_by_agusrockforlife_ddyqyd9.png",
    "gambar1.png",
    "gambar1.jpeg",
    "gambar2.png"
  ];
  for (const name of rootTextures) {
    const inputPath = path.join(PUBLIC_DIR, name);
    if (fs.existsSync(inputPath)) {
      const outputPath = path.join(PUBLIC_DIR, name.replace(/\.(png|jpe?g)$/i, ".webp"));
      await optimizeImage(inputPath, outputPath, { maxWidth: 1920, quality: 90 });
    }
  }

  saveCache();
  console.log("✨ Asset Optimization Pipeline Completed Successfully.");
}

runAutoOptimizer().catch((err) => {
  console.error("❌ Asset Optimization Failed:", err);
  process.exit(1);
});
