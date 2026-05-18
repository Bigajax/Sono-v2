// Normaliza logos de bandeiras de cartão para altura uniforme.
// As imagens-fonte já vêm com background removido (via remove.bg), então
// aqui é só resize + reencode para PNG otimizado.
//
// Rodar: node scripts/process-card-brands.mjs

import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const SRC_DIR = 'C:/Users/Rafael/Downloads';
const OUT_DIR = path.resolve('public/images/cards');
const TARGET_HEIGHT = 64; // 2x para retina; DOM renderiza ~32px

const files = [
  { src: 'visa-removebg-preview.png',       out: 'visa.png' },
  { src: 'mastercad-removebg-preview.png',  out: 'mastercard.png' },
  { src: 'cartao-elo-removebg-preview.png', out: 'elo.png' },
  { src: 'amex-removebg-preview.png',       out: 'amex.png' },
  { src: 'hipercard-removebg-preview.png',  out: 'hipercard.png' },
];

await fs.mkdir(OUT_DIR, { recursive: true });

for (const { src, out } of files) {
  const inPath = path.join(SRC_DIR, src);
  const outPath = path.join(OUT_DIR, out);
  const meta = await sharp(inPath).metadata();
  await sharp(inPath)
    .resize({ height: TARGET_HEIGHT, fit: 'inside', withoutEnlargement: false })
    .png({ compressionLevel: 9 })
    .toFile(outPath);
  const outMeta = await sharp(outPath).metadata();
  console.log(
    `${src.padEnd(36)} ${meta.width}x${meta.height} → ${out.padEnd(15)} ${outMeta.width}x${outMeta.height}`
  );
}

console.log('\n✓ Done. Files in:', OUT_DIR);
