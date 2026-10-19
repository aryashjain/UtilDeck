// CSV parsing and writing, and base conversion. Pure functions, checked directly.

// RFC 4180-style CSV: quoted fields, doubled quotes, commas and line breaks inside quotes
export function parseCsv(text, delimiter = ',') {
  const rows = [];
  let row = [], field = '', i = 0, quoted = false;
  const s = String(text).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  while (i < s.length) {
    const c = s[i];
    if (quoted) {
      if (c === '"') {
        if (s[i + 1] === '"') { field += '"'; i += 2; continue; }
        quoted = false; i++; continue;
      }
      field += c; i++; continue;
    }
    if (c === '"' && field === '') { quoted = true; i++; continue; }
    if (c === delimiter) { row.push(field); field = ''; i++; continue; }
    if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++; continue; }
    field += c; i++;
  }
  if (quoted) throw new Error('A quoted field is not closed. Check for a missing ".');
  if (field !== '' || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

// Converts CSV text (first row = headers) into an array of objects, with numbers and booleans typed
export function csvToObjects(text, delimiter = ',') {
  const rows = parseCsv(text, delimiter).filter(r => !(r.length === 1 && r[0] === ''));
  if (rows.length < 2) throw new Error('The CSV needs a header row and at least one data row.');
  const headers = rows[0].map(h => h.trim());
  if (headers.some(h => h === '')) throw new Error('Every column needs a name in the first row.');
  return rows.slice(1).map(r => Object.fromEntries(headers.map((h, i) => [h, typed(r[i] ?? '')])));
}

function typed(v) {
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (v.trim() !== '' && /^-?\d+(\.\d+)?$/.test(v.trim())) return Number(v.trim());
  return v;
}

const csvCell = v => {
  const s = v === null || v === undefined ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v);
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};

// Writes an array of objects as CSV. Column order is the union of keys, in first-seen order.
export function objectsToCsv(list) {
  if (!Array.isArray(list)) throw new Error('JSON must be an array of objects, for example [{"name": "Ana"}].');
  if (list.length === 0) return '';
  for (const item of list) if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error('Every item in the array must be an object.');
  const headers = [...new Set(list.flatMap(o => Object.keys(o)))];
  const lines = [headers.map(csvCell).join(',')];
  for (const o of list) lines.push(headers.map(h => csvCell(o[h])).join(','));
  return lines.join('\n') + '\n';
}

// ---- Base conversion (BigInt, so long numbers stay exact) ----
const BASES = { 2: 'binary', 8: 'octal', 10: 'decimal', 16: 'hex' };
export const BASE_NAMES = BASES;

export function convertBase(text, fromBase) {
  const base = Number(fromBase);
  if (!BASES[base]) throw new Error('Choose binary, octal, decimal or hex.');
  let clean = String(text).trim().replace(/[\s_]/g, '');
  if (base === 16) clean = clean.replace(/^0x/i, '');
  if (base === 2) clean = clean.replace(/^0b/i, '');
  if (base === 8) clean = clean.replace(/^0o/i, '');
  if (clean === '') throw new Error('Enter a number.');
  const valid = { 2: /^[01]+$/, 8: /^[0-7]+$/, 10: /^\d+$/, 16: /^[0-9a-f]+$/i }[base];
  if (!valid.test(clean)) throw new Error(`That is not a valid ${BASES[base]} number.`);
  let value = 0n;
  const big = BigInt(base);
  for (const ch of clean.toLowerCase()) value = value * big + BigInt(parseInt(ch, 36));
  return { binary: value.toString(2), octal: value.toString(8), decimal: value.toString(10), hex: value.toString(16).toUpperCase() };
}
