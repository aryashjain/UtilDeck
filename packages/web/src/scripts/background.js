// Removes a solid-colour background: pixels that match the border colour, and connect to the edge, become transparent.
// Works on { width, height, data } where data is RGBA bytes (like ImageData). Returns a new copy.

// Most common colour along the border, grouped to 8 levels per channel so near-identical pixels count together
export function borderColour(image) {
  const { width, height, data } = image;
  const counts = new Map();
  const add = (x, y) => {
    const i = (y * width + x) * 4;
    const key = [data[i], data[i + 1], data[i + 2]].map(v => v >> 3).join(',');
    counts.set(key, (counts.get(key) || 0) + 1);
  };
  for (let x = 0; x < width; x++) { add(x, 0); add(x, height - 1); }
  for (let y = 0; y < height; y++) { add(0, y); add(width - 1, y); }
  let best = null, bestCount = -1;
  for (const [key, count] of counts) if (count > bestCount) { best = key; bestCount = count; }
  if (!best) throw new Error('The image is empty.');
  // Average the real colours that fall in that bucket for a more accurate target
  let r = 0, g = 0, b = 0, n = 0;
  const bucket = best.split(',').map(Number);
  const check = (x, y) => {
    const i = (y * width + x) * 4;
    if ([data[i], data[i + 1], data[i + 2]].every((v, k) => (v >> 3) === bucket[k])) { r += data[i]; g += data[i + 1]; b += data[i + 2]; n++; }
  };
  for (let x = 0; x < width; x++) { check(x, 0); check(x, height - 1); }
  for (let y = 0; y < height; y++) { check(0, y); check(width - 1, y); }
  return { r: Math.round(r / n), g: Math.round(g / n), b: Math.round(b / n) };
}

// tolerance: 0 to 100. 0 removes only exact matches; 100 removes almost everything.
export function removeBackground(image, tolerance = 30) {
  const t = Number(tolerance);
  if (!(t >= 0 && t <= 100)) throw new Error('Tolerance must be between 0 and 100.');
  const { width, height } = image;
  const out = new Uint8ClampedArray(image.data);
  const target = borderColour(image);
  const limit = (t / 100) * 441.67; // largest possible RGB distance is about 441.67
  const near = i => Math.hypot(out[i] - target.r, out[i + 1] - target.g, out[i + 2] - target.b) <= limit;

  // Flood fill from every edge pixel that matches the background colour
  const seen = new Uint8Array(width * height);
  const queue = [];
  const push = (x, y) => {
    const p = y * width + x;
    if (seen[p]) return;
    seen[p] = 1;
    if (near(p * 4)) queue.push(p);
  };
  for (let x = 0; x < width; x++) { push(x, 0); push(x, height - 1); }
  for (let y = 0; y < height; y++) { push(0, y); push(width - 1, y); }
  for (let q = 0; q < queue.length; q++) {
    const p = queue[q];
    out[p * 4 + 3] = 0;
    const x = p % width, y = (p - x) / width;
    if (x > 0) push(x - 1, y);
    if (x < width - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < height - 1) push(x, y + 1);
  }
  return { width, height, data: out, removed: queue.length, colour: target };
}
