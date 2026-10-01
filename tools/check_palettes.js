// Checks potion palettes: every pair a level can show must be clearly apart (OKLab distance) and no color too dark/light for the tubes.
const PALETTES = require('../palettes.js');
const MAX_COLORS = 9, MIN_DIST = 0.085, L_RANGE = [0.55, 0.94];

function oklab(hex) {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

let bad = 0;
for (const p of PALETTES) {
  const cs = p.c.slice(0, MAX_COLORS), labs = cs.map(oklab);
  if (cs.length < MAX_COLORS) { console.log(`${p.en}: needs ${MAX_COLORS} colors`); bad++; }
  let min = Infinity, pair = '';
  for (let i = 0; i < cs.length; i++) {
    if (labs[i][0] < L_RANGE[0] || labs[i][0] > L_RANGE[1]) { console.log(`${p.en}: ${cs[i]} lightness ${labs[i][0].toFixed(2)} out of range`); bad++; }
    for (let j = 0; j < i; j++) { const d = dist(labs[i], labs[j]); if (d < min) { min = d; pair = `${cs[j]}~${cs[i]}`; } }
  }
  const ok = min >= MIN_DIST;
  if (!ok) bad++;
  console.log(`${ok ? 'ok ' : 'BAD'} ${p.en.padEnd(13)} closest ${pair} ${min.toFixed(3)}`);
}
process.exit(bad ? 1 : 0);
