// Cria uma versão "branca" da logo Ecotopia para usar no mockup do iPhone
// (fundo escuro). A logo original já tem canal alpha — pixels de fundo
// têm alpha 0. Só precisamos pintar os pixels visíveis (alpha > 0) de
// branco puro, preservando o alpha para anti-aliasing.

import sharp from 'sharp';
import path from 'node:path';

const SRC = path.resolve('public/images/logo-nav.webp');
const OUT = path.resolve('public/images/logo-light.webp');

const { data, info } = await sharp(SRC)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height } = info;
const pixels = Buffer.from(data);

let visiblePixels = 0;
let transparentPixels = 0;

for (let i = 0; i < pixels.length; i += 4) {
  const alpha = pixels[i + 3];
  if (alpha === 0) {
    transparentPixels++;
    continue;
  }
  // Pixel visível → branco puro (alpha original preserva anti-aliasing)
  pixels[i] = 255;
  pixels[i + 1] = 255;
  pixels[i + 2] = 255;
  visiblePixels++;
}

await sharp(pixels, {
  raw: { width, height, channels: 4 },
})
  // Recortar para a bounding box dos pixels visíveis evita renderizar
  // muito espaço transparente no <img>.
  .trim({ threshold: 1 })
  .webp({ quality: 92, effort: 6 })
  .toFile(OUT);

const outMeta = await sharp(OUT).metadata();

console.log(`✓ ${path.basename(OUT)} criada`);
console.log(`  origem: ${width}x${height}`);
console.log(`  saída : ${outMeta.width}x${outMeta.height}  (após trim)`);
console.log(`  pixels visíveis: ${visiblePixels} · transparentes: ${transparentPixels}`);
