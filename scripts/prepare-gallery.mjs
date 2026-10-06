// Gallery web copies with ONE shared grade, so the iPhone shots (neutral) and
// the professional functional set (warm/teal) read as the same place.
// Originals are untouched. Run: node scripts/prepare-gallery.mjs
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = "public/images/gallery";
mkdirSync(OUT, { recursive: true });

const smoothstep = (e0, e1, x) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

// id, source, optional crop (in source pixels)
const SOURCES = [
  ["sala-pesi-1", "public/images/hero/hero.jpg"],
  ["sala-pesi-2", "public/images/sala-deo-2/sala/sala-08.jpg"],
  ["sala-pesi-3", "public/images/sala-deo-2/sala/sala-10.jpg"],
  ["macchinari-1", "public/images/sala-deo-2/sala/sala-09.jpg"],
  ["macchinari-2", "public/images/sala-deo-2/sala/sala-12.jpg"],
  ["macchinari-3", "public/images/sala-deo-2/sala/sala-11.jpg"],
  ["functional-1", "public/images/functional/functional-01.jpg"],
  ["functional-2", "public/images/functional/functional-04.jpg"],
  ["functional-3", "public/images/functional/functional-02.jpg", { left: 430, top: 440, width: 640, height: 640 }],
  ["functional-4", "public/images/functional/functional-05.jpg"],
  ["functional-5", "public/images/functional/functional-03.jpg"],
  ["functional-6", "public/images/functional/functional-06.jpg"],
  ["coaching-1", "public/images/coaching/coaching-02.jpg"],
  ["coaching-2", "public/images/coaching/coaching-03.jpg"],
  ["coaching-3", "public/images/coaching/coaching-04.jpg"],
];

const sizes = {};
for (const [id, src, crop] of SOURCES) {
  let img = sharp(src).rotate();
  if (crop) img = img.extract(crop);
  img = img.resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true }).removeAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // Gray-world white balance, applied at 60% and aimed slightly warm.
  let sr = 0, sg = 0, sb = 0;
  for (let i = 0; i < data.length; i += channels) { sr += data[i]; sg += data[i + 1]; sb += data[i + 2]; }
  const n = data.length / channels, avg = (sr + sg + sb) / (3 * n);
  const mix = (gain) => 1 + (gain - 1) * 0.6;
  const wb = [mix((avg * 1.02) / (sr / n)), mix(avg / (sg / n)), mix((avg * 0.97) / (sb / n))];

  for (let i = 0; i < data.length; i += channels) {
    let r = Math.min(1, (data[i] / 255) * wb[0]);
    let g = Math.min(1, (data[i + 1] / 255) * wb[1]);
    let b = Math.min(1, (data[i + 2] / 255) * wb[2]);
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const s = max ? (max - min) / max : 0;
    const hue = max === r && max > min ? Math.abs((60 * (g - b)) / (max - min)) : 999;
    const red = (1 - smoothstep(14, 28, hue)) * smoothstep(0.3, 0.5, s);
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const sat = 0.8 + 0.25 * red; // ~20% less saturation, reds kept
    const out = [r, g, b].map((c) => {
      c = lum + (c - lum) * sat;
      c = c + 0.35 * c * (1 - c) * (c - 0.5); // a touch more contrast
      return Math.round(Math.min(1, Math.max(0, c)) * 255);
    });
    data[i] = out[0]; data[i + 1] = out[1]; data[i + 2] = out[2];
  }
  await sharp(data, { raw: { width, height, channels } }).jpeg({ quality: 82, mozjpeg: true }).toFile(`${OUT}/${id}.jpg`);
  sizes[id] = [width, height];
}
writeFileSync(".verify/gallery-sizes.json", JSON.stringify(sizes, null, 1));
console.log(sizes);
