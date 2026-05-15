import sharp from 'sharp';
import { readdir, stat, rename, unlink } from 'node:fs/promises';
import { join, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, '..', 'public');

const THRESHOLD = 300 * 1024;
const MAX_DIM = 1600;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) files.push(...(await walk(full)));
    else if (e.isFile() && extname(e.name).toLowerCase() === '.webp') files.push(full);
  }
  return files;
}

const webps = await walk(root);
let before = 0;
let after = 0;

for (const file of webps) {
  const s0 = await stat(file);
  before += s0.size;
  if (s0.size < THRESHOLD) {
    after += s0.size;
    continue;
  }

  const tmp = file + '.tmp.webp';
  const meta = await sharp(file).metadata();
  let pipeline = sharp(file);
  const maxDim = Math.max(meta.width || 0, meta.height || 0);
  if (maxDim > MAX_DIM) {
    pipeline = pipeline.resize({
      width: meta.width && meta.width >= meta.height ? MAX_DIM : undefined,
      height: meta.height && meta.height > meta.width ? MAX_DIM : undefined,
      withoutEnlargement: true,
    });
  }
  await pipeline.webp({ quality: 78, effort: 6 }).toFile(tmp);

  const s1 = await stat(tmp);
  if (s1.size < s0.size) {
    await unlink(file);
    await rename(tmp, file);
    after += s1.size;
    console.log(`opt    ${relative(root, file)}  ${(s0.size / 1024).toFixed(0)} KB -> ${(s1.size / 1024).toFixed(0)} KB`);
  } else {
    await unlink(tmp);
    after += s0.size;
    console.log(`keep   ${relative(root, file)}  (re-encode didn't help)`);
  }
}

console.log(`\nBefore: ${(before / 1024 / 1024).toFixed(1)} MB`);
console.log(`After:  ${(after / 1024 / 1024).toFixed(1)} MB`);
console.log(`Saved:  ${((1 - after / before) * 100).toFixed(0)}%`);
