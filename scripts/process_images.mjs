#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';

async function ensureSharp() {
  try {
    const sharp = (await import('sharp')).default;
    return sharp;
  } catch (err) {
    console.error('\n[process_images] Missing dependency: sharp');
    console.error('Install it with:');
    console.error('  npm i -D sharp');
    process.exit(1);
  }
}

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

function log(...args) { console.log('[process_images]', ...args); }

async function readJSON(p, fallback = {}) {
  try {
    const s = await fs.readFile(p, 'utf8');
    return JSON.parse(s);
  } catch { return fallback; }
}

function parseArgs() {
  const argv = process.argv.slice(2);
  const opts = { task: 'all', coverDir: 'src/assets/covers', outDir: 'public/covers', bannerSvg: 'public/banner.svg', bannerPngOut: 'src/assets/image', aspect: 'auto' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const val = argv[i+1];
    if (a === '--task' && val) { opts.task = val; i++; }
    else if (a === '--covers' && val) { opts.coverDir = val; i++; }
    else if (a === '--out' && val) { opts.outDir = val; i++; }
    else if (a === '--banner' && val) { opts.bannerSvg = val; i++; }
    else if (a === '--banner-out' && val) { opts.bannerPngOut = val; i++; }
    else if (a === '--aspect' && val) { opts.aspect = val; i++; }
  }
  return opts;
}

function toAbs(p) {
  return path.isAbsolute(p) ? p : path.join(repoRoot, p);
}

async function ensureDir(dir) { await fs.mkdir(dir, { recursive: true }); }

function clampCoverPipeline(sharp, aspect) {
  return (image) => {
    if (aspect && aspect !== 'auto') {
      const [w, h] = aspect.split(':').map(Number);
      if (w > 0 && h > 0) return image.resize({ width: 1200, height: Math.round(1200 * h / w), fit: 'cover', position: 'entropy' });
    }
    return image.resize({ width: 1200, withoutEnlargement: true });
  };
}

async function processBanner(sharp, svgPath, outDir) {
  svgPath = toAbs(svgPath);
  outDir = toAbs(outDir);
  await ensureDir(outDir);
  const baseName = 'banner';
  const targets = [
    { w: 1440, h: 720, suffix: '' },
    { w: 2880, h: 1440, suffix: '@2x' },
  ];
  log('Banner from', path.relative(repoRoot, svgPath), '→', path.relative(repoRoot, outDir));
  const svgBuf = await fs.readFile(svgPath);
  for (const t of targets) {
    const outPng = path.join(outDir, `${baseName}${t.suffix}.png`);
    await sharp(svgBuf).resize(t.w, t.h, { fit: 'cover' }).png({ compressionLevel: 9 }).toFile(outPng);
    log('  ✓', path.relative(repoRoot, outPng), `${t.w}x${t.h}`);
  }
}

async function processCovers(sharp, inDir, outDir, aspect = 'auto') {
  inDir = toAbs(inDir);
  outDir = toAbs(outDir);
  await ensureDir(outDir);
  const entries = await fs.readdir(inDir);
  const files = entries.filter(f => /\.(jpe?g|png|webp)$/i.test(f));
  if (!files.length) { log('No cover files found in', path.relative(repoRoot, inDir)); return; }
  const sizes = [480, 720, 960, 1200];
  const results = [];
  const pipelineFor = clampCoverPipeline(sharp, aspect);
  for (const f of files) {
    const stem = f.replace(/\.[^.]+$/, '');
    const inPath = path.join(inDir, f);
    const buf = await fs.readFile(inPath);
    const img = sharp(buf).rotate();
    const piped = pipelineFor(img.clone());
    const outBase = path.join(outDir, stem);
    await ensureDir(outDir);
    // Original-quality JPEG (optimized)
    const jpg1200 = `${outBase}-1200.jpg`;
    await piped.clone().jpeg({ quality: 82, mozjpeg: true }).toFile(jpg1200);
    // Generate responsive WEBP/AVIF
    const generated = { stem, variants: [] };
    for (const w of sizes) {
      const webp = `${outBase}-${w}.webp`;
      const avif = `${outBase}-${w}.avif`;
      await img.clone().resize({ width: w, withoutEnlargement: true }).webp({ quality: 75 }).toFile(webp);
      await img.clone().resize({ width: w, withoutEnlargement: true }).avif({ quality: 60 }).toFile(avif);
      generated.variants.push({ width: w, webp: path.relative(repoRoot, webp), avif: path.relative(repoRoot, avif) });
    }
    results.push(generated);
    log('  ✓', stem, '→ responsive sets');
  }
  const manifestPath = path.join(outDir, 'manifest.json');
  await fs.writeFile(manifestPath, JSON.stringify({ generatedAt: new Date().toISOString(), sizes, covers: results }, null, 2));
  log('Manifest:', path.relative(repoRoot, manifestPath));
}

async function main() {
  const sharp = await ensureSharp();
  const opts = parseArgs();
  if (opts.task === 'banner' || opts.task === 'all') {
    await processBanner(sharp, opts.bannerSvg, opts.bannerPngOut);
  }
  if (opts.task === 'covers' || opts.task === 'all') {
    await processCovers(sharp, opts.coverDir, opts.outDir, opts.aspect);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });

