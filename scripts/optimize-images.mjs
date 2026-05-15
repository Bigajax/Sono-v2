// Converte PNGs para WebP em public/ — preserva originais.
// Rodar: node scripts/optimize-images.mjs

import sharp from 'sharp';
import { readdir, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, '..', 'public');

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (entry.isFile() && /\.png$/i.test(entry.name)) {
      yield full;
    }
  }
}

const fmtKB = (n) => `${(n / 1024).toFixed(1)} KB`;

let total = 0;
let converted = 0;
let totalPng = 0;
let totalWebp = 0;

for await (const pngPath of walk(PUBLIC_DIR)) {
  total++;
  const webpPath = pngPath.replace(/\.png$/i, '.webp');

  // Pula se WebP já existe e é mais novo
  if (existsSync(webpPath)) {
    const [pngStat, webpStat] = await Promise.all([stat(pngPath), stat(webpPath)]);
    if (webpStat.mtimeMs >= pngStat.mtimeMs) {
      console.log(`✓ skip (já existe)  ${pngPath.replace(PUBLIC_DIR, '')}`);
      continue;
    }
  }

  const pngSize = (await stat(pngPath)).size;
  await sharp(pngPath).webp({ quality: 82, effort: 6 }).toFile(webpPath);
  const webpSize = (await stat(webpPath)).size;

  totalPng += pngSize;
  totalWebp += webpSize;
  converted++;

  const saved = (1 - webpSize / pngSize) * 100;
  console.log(
    `→ ${pngPath.replace(PUBLIC_DIR, '')}  ${fmtKB(pngSize)} → ${fmtKB(webpSize)}  (-${saved.toFixed(0)}%)`,
  );
}

console.log(
  `\n${converted}/${total} convertidos. Total: ${fmtKB(totalPng)} → ${fmtKB(totalWebp)} (-${(
    (1 - totalWebp / totalPng) *
    100
  ).toFixed(0)}%)`,
);
