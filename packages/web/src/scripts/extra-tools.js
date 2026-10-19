// Calculations for the newer tools. Pure functions, so they can be checked directly.

// ---- Unit converter ----
export const UNIT_TABLES = {
  length: { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.344, yd: 0.9144, ft: 0.3048, in: 0.0254 },
  weight: { kg: 1, g: 0.001, mg: 0.000001, lb: 0.45359237, oz: 0.028349523125 },
  volume: { l: 1, ml: 0.001, 'US gal': 3.785411784, 'US cup': 0.2365882365, 'fl oz': 0.0295735295625 },
  data: { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4 },
  temperature: { C: 'C', F: 'F', K: 'K' },
};

export function convertUnits(value, category, from, to) {
  const n = Number(value);
  if (!Number.isFinite(n)) throw new Error('Enter a number.');
  const table = UNIT_TABLES[category];
  if (!table || !(from in table) || !(to in table)) throw new Error('Choose units from the same group.');
  if (category === 'temperature') {
    const toC = { C: v => v, F: v => (v - 32) * 5 / 9, K: v => v - 273.15 };
    const fromC = { C: c => c, F: c => c * 9 / 5 + 32, K: c => c + 273.15 };
    return fromC[to](toC[from](n));
  }
  return (n * table[from]) / table[to];
}

// ---- Timestamp converter ----
export function timestampToIso(input, unit = 'seconds') {
  const n = Number(input);
  if (!Number.isFinite(n)) throw new Error('Enter a number.');
  const date = new Date(unit === 'seconds' ? n * 1000 : n);
  if (Number.isNaN(date.getTime())) throw new Error('That timestamp is out of range.');
  return date.toISOString();
}

export function isoToTimestamp(text) {
  const ms = Date.parse(String(text).trim());
  if (Number.isNaN(ms)) throw new Error('Enter a date such as 2026-10-19 or 2026-10-19T12:00:00Z.');
  return { seconds: Math.floor(ms / 1000), milliseconds: ms };
}

// ---- Color converter and contrast ----
export function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(hex).trim());
  if (!m) throw new Error('Enter a color such as #1e90ff or #fff.');
  let h = m[1];
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
}

export function rgbToHex({ r, g, b }) {
  return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
}

export function rgbToHsl({ r, g, b }) {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
    else if (max === gn) h = ((bn - rn) / d + 2) / 6;
    else h = ((rn - gn) / d + 4) / 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function luminance({ r, g, b }) {
  const lin = v => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

// WCAG contrast ratio between two colors (1 to 21)
export function contrastRatio(hexA, hexB) {
  const a = luminance(hexToRgb(hexA)), b = luminance(hexToRgb(hexB));
  const [hi, lo] = a >= b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

// ---- Regex tester ----
export function findMatches(pattern, flags, text, limit = 500) {
  const cleanFlags = [...new Set(String(flags).replace(/[^gimsuy]/g, '') + 'g')].join('');
  const re = new RegExp(pattern, cleanFlags);
  const matches = [];
  for (const m of String(text).matchAll(re)) {
    matches.push({ index: m.index, match: m[0], groups: m.slice(1) });
    if (matches.length >= limit) break;
  }
  return matches;
}

// ---- Hashing (SHA family, via the browser's Web Crypto) ----
export const HASH_ALGORITHMS = { 'SHA-1': 'SHA-1', 'SHA-256': 'SHA-256', 'SHA-384': 'SHA-384', 'SHA-512': 'SHA-512' };

export async function hashText(text, algorithm) {
  const algo = HASH_ALGORITHMS[algorithm];
  if (!algo) throw new Error('Choose a hash algorithm.');
  const bytes = new TextEncoder().encode(String(text));
  const digest = await globalThis.crypto.subtle.digest(algo, bytes);
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
}

// ---- Markdown preview (escapes HTML first, so pasted HTML is shown as text) ----
const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function inline(text) {
  let out = text;
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (all, label, url) => {
    const safe = /^(https?:\/\/|mailto:)/i.test(url);
    return safe ? `<a href="${url}" rel="noopener">${label}</a>` : label;
  });
  return out;
}

export function renderMarkdown(source) {
  const lines = esc(String(source)).split('\n');
  const html = [];
  let inCode = false, list = null, para = [];
  const flushPara = () => { if (para.length) { html.push(`<p>${inline(para.join(' '))}</p>`); para = []; } };
  const closeList = () => { if (list) { html.push(`</${list}>`); list = null; } };

  for (const raw of lines) {
    if (raw.trim().startsWith('```')) {
      flushPara(); closeList();
      html.push(inCode ? '</code></pre>' : '<pre><code>');
      inCode = !inCode;
      continue;
    }
    if (inCode) { html.push(raw + '\n'); continue; }
    const heading = /^(#{1,6})\s+(.*)$/.exec(raw);
    const bullet = /^\s*[-*]\s+(.*)$/.exec(raw);
    const numbered = /^\s*\d+\.\s+(.*)$/.exec(raw);
    if (!raw.trim()) { flushPara(); closeList(); continue; }
    if (heading) { flushPara(); closeList(); html.push(`<h${heading[1].length}>${inline(heading[2])}</h${heading[1].length}>`); continue; }
    if (bullet || numbered) {
      flushPara();
      const kind = bullet ? 'ul' : 'ol';
      if (list !== kind) { closeList(); html.push(`<${kind}>`); list = kind; }
      html.push(`<li>${inline((bullet || numbered)[1])}</li>`);
      continue;
    }
    closeList();
    para.push(raw.trim());
  }
  if (inCode) html.push('</code></pre>');
  flushPara(); closeList();
  return html.join('\n');
}

// ---- Health ----
export function bmi(weightKg, heightCm) {
  const w = Number(weightKg), h = Number(heightCm) / 100;
  if (!(w > 0 && h > 0)) throw new Error('Enter a valid weight and height.');
  const value = w / (h * h);
  const category = value < 18.5 ? 'Underweight' : value < 25 ? 'Healthy weight' : value < 30 ? 'Overweight' : 'Obesity';
  return { value: Math.round(value * 10) / 10, category };
}

export function waterIntakeMl(weightKg, exerciseMinutes = 0) {
  const w = Number(weightKg);
  if (!(w > 0)) throw new Error('Enter a valid weight.');
  const extra = (Math.max(0, Number(exerciseMinutes)) / 30) * 350;
  return Math.round(w * 35 + extra);
}

export const PROTEIN_GOALS = {
  general: { label: 'General health (0.8 g per kg)', factor: 0.8 },
  active: { label: 'Regular exercise (1.4 g per kg)', factor: 1.4 },
  muscle: { label: 'Building muscle (2.0 g per kg)', factor: 2.0 },
};

export function proteinGrams(weightKg, goal) {
  const w = Number(weightKg);
  if (!(w > 0)) throw new Error('Enter a valid weight.');
  if (!PROTEIN_GOALS[goal]) throw new Error('Choose a goal.');
  return Math.round(w * PROTEIN_GOALS[goal].factor);
}

// ---- Calculators ----
export function splitBill({ total, tipPercent = 0, people }) {
  const t = Number(total), tip = Number(tipPercent), n = Number(people);
  if (!(t >= 0)) throw new Error('Enter the bill total.');
  if (!(tip >= 0)) throw new Error('Tip cannot be negative.');
  if (!Number.isInteger(n) || n < 1) throw new Error('People must be a whole number, 1 or more.');
  const tipAmount = t * tip / 100;
  const grandTotal = t + tipAmount;
  return { tipAmount: round2(tipAmount), grandTotal: round2(grandTotal), perPerson: round2(grandTotal / n) };
}

export function percentOf(percent, value) {
  return (Number(percent) / 100) * Number(value);
}

export function whatPercent(part, whole) {
  if (Number(whole) === 0) throw new Error('The whole cannot be zero.');
  return (Number(part) / Number(whole)) * 100;
}

export function percentChange(from, to) {
  if (Number(from) === 0) throw new Error('Starting value cannot be zero.');
  return ((Number(to) - Number(from)) / Number(from)) * 100;
}

const round2 = v => Math.round(v * 100) / 100;

// ---- Random name picker ----
export function parseNames(text) {
  return String(text).split('\n').map(s => s.trim()).filter(Boolean);
}

// Picks `count` different names at random (Fisher-Yates with the browser's secure random source)
export function pickNames(names, count) {
  const n = Number(count);
  if (!Number.isInteger(n) || n < 1) throw new Error('Pick at least one winner.');
  if (n > names.length) throw new Error(`You need at least ${n} names; you have ${names.length}.`);
  const pool = [...names];
  const random = limit => {
    const buffer = new Uint32Array(1);
    const cap = Math.floor(0x100000000 / limit) * limit;
    let x;
    do { globalThis.crypto.getRandomValues(buffer); x = buffer[0]; } while (x >= cap);
    return x % limit;
  };
  for (let i = pool.length - 1; i > 0; i--) {
    const j = random(i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}
