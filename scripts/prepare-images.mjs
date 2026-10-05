// Builds the web masters from the original camera file (5712×4284, untouched).
// Run: node scripts/prepare-images.mjs
//
// Brand grade: black / white / red. Everything is desaturated and cooled
// except the red upholstery, contrast goes up, midtones go down, plus a soft
// vignette. Pixels are never moved, so the LED tracing in LedLines.tsx stays valid.
import sharp from "sharp";

const SRC = "public/images/hero/hero.jpg";

const smoothstep = (e0, e1, x) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

// How "Panatta red" a pixel is: 0..1, soft edges in hue, saturation and value.
function redness(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const v = max;
  const s = max === 0 ? 0 : (max - min) / max;
  if (max !== r) return 0;
  // hue in degrees, red around 0 (negative = magenta side)
  let h = (60 * (g - b)) / (max - min || 1);
  const hueW = 1 - smoothstep(12, 26, Math.abs(h));
  return hueW * smoothstep(0.28, 0.5, s) * smoothstep(0.1, 0.22, v);
}

async function grade(input, { width, height, vignette = 0.58 }) {
  const { data, info } = await input.raw().toBuffer({ resolveWithObject: true });
  const { channels } = info;
  const cx = width / 2;
  const cy = height * 0.46;
  const rx = width * 0.62;
  const ry = height * 0.66;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      let r = data[i] / 255;
      let g = data[i + 1] / 255;
      let b = data[i + 2] / 255;

      const red = redness(r, g, b);
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;

      // Saturation: ~monochrome everywhere, reds kept and pushed a touch.
      const sat = 0.12 + red * 1.03;
      r = lum + (r - lum) * sat;
      g = lum + (g - lum) * sat;
      b = lum + (b - lum) * sat;

      // Cooler neutrals (not the reds).
      const cool = 1 - red;
      r -= 0.018 * cool;
      b += 0.022 * cool;

      // Darker midtones + S-curve contrast; whites stay white (LEDs, walls).
      for (const k of [0, 1, 2]) {
        let c = k === 0 ? r : k === 1 ? g : b;
        c = Math.max(0, c) ** 1.42;
        c = c + 0.9 * c * (1 - c) * (c - 0.42); // contrast around 0.42
        if (k === 0) r = c;
        else if (k === 1) g = c;
        else b = c;
      }

      // Soft elliptical vignette.
      const d = Math.hypot((x - cx) / rx, (y - cy) / ry);
      const vig = 1 - vignette * smoothstep(0.5, 1.12, d);

      data[i] = Math.round(Math.min(1, Math.max(0, r * vig)) * 255);
      data[i + 1] = Math.round(Math.min(1, Math.max(0, g * vig)) * 255);
      data[i + 2] = Math.round(Math.min(1, Math.max(0, b * vig)) * 255);
    }
  }
  return sharp(data, { raw: { width, height, channels } });
}

async function master(width, height, fit, src = SRC, vignette) {
  const resized = sharp(src).rotate().resize({ width, height, fit, position: "centre" }).removeAlpha();
  const { info } = await resized.clone().raw().toBuffer({ resolveWithObject: true });
  return grade(resized, { width: info.width, height: info.height, vignette });
}

await (await master(2560, undefined, "inside"))
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile("public/images/hero/hero-2560.jpg");

// Source for app/opengraph-image.tsx (build-time only, kept out of /public).
await (await master(1200, 630, "cover"))
  .jpeg({ quality: 78, mozjpeg: true })
  .toFile("assets/og-source.jpg");

// Servizi panels: same grade, lighter vignette (panels add their own shade).
const SERVICES = {
  "sala-pesi": "public/images/sala-deo-2/sala/sala-08.jpg",
  "macchinari-panatta": "public/images/sala-deo-2/sala/sala-09.jpg",
  "functional-training": "public/images/functional/functional-04.jpg",
  "personal-training": "public/images/coaching/coaching-03.jpg",
};
for (const [id, src] of Object.entries(SERVICES)) {
  const { width } = await sharp(src).metadata();
  await (await master(Math.min(1600, width), undefined, "inside", src, 0.32))
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(`public/images/services/${id}.jpg`);
}

console.log("done");
