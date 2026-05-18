// Processa a imagem de capa da introdução (apresentação da Arabella).
// Pega o PNG gerado pelo DALL-E, redimensiona para 1024x1024 (retina-ready
// num mockup que renderiza ~280-320px) e exporta como WebP otimizado.
//
// Rodar uma vez: node scripts/process-intro-cover.mjs

import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const SRC = 'C:/Users/Rafael/Downloads/ChatGPT Image 18 de mai. de 2026, 13_27_03.png';
// Imagem dedicada da introdução do protocolo (mockup do iPhone).
// NÃO sobrescrever desligando-estado-alerta.webp — essa é a arte da Noite 1
// no NightsGrid e nas referências internas do protocolo.
const OUT = path.resolve('public/images/intro-arabella.webp');

// Backup do arquivo anterior (caso queira reverter)
const BACKUP = path.resolve('public/images/intro-arabella.bak.webp');
try {
  await fs.access(OUT);
  await fs.copyFile(OUT, BACKUP);
  console.log(`Backup salvo: ${BACKUP}`);
} catch {
  console.log('(sem arquivo anterior para backup)');
}

const srcMeta = await sharp(SRC).metadata();

await sharp(SRC)
  .resize(1024, 1024, { fit: 'cover', position: 'center' })
  .webp({ quality: 88, effort: 6 })
  .toFile(OUT);

const outMeta = await sharp(OUT).metadata();
const outSize = (await fs.stat(OUT)).size;

console.log(`\n✓ Done`);
console.log(`  src: ${path.basename(SRC)}  ${srcMeta.width}x${srcMeta.height}`);
console.log(`  out: ${path.basename(OUT)}  ${outMeta.width}x${outMeta.height}  (${(outSize / 1024).toFixed(1)} KB)`);
