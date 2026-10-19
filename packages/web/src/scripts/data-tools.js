// UUIDs, URL parsing and building, and random table data. Pure functions, checked directly.

export const MAX_ROWS = 1000000;
export const MAX_COLUMNS = 10;
export const MAX_COPY_ROWS = 10000; // copy to clipboard only up to this many rows; larger sets download

// ---- UUID ----
export function uuidV4() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') return globalThis.crypto.randomUUID();
  const b = globalThis.crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map(x => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export function uuids(count, { uppercase = false, hyphens = true } = {}) {
  const n = Number(count);
  if (!Number.isInteger(n) || n < 1 || n > MAX_ROWS) throw new Error(`Enter a whole number from 1 to ${MAX_ROWS.toLocaleString()}.`);
  const out = new Array(n);
  for (let i = 0; i < n; i++) {
    let u = uuidV4();
    if (!hyphens) u = u.replace(/-/g, '');
    out[i] = uppercase ? u.toUpperCase() : u;
  }
  return out;
}

// ---- URL ----
export function parseUrl(text) {
  let u;
  try {
    u = new URL(String(text).trim());
  } catch {
    throw new Error('That is not a complete link. Include the scheme, for example https://example.com/path?x=1.');
  }
  const params = [];
  u.searchParams.forEach((value, key) => params.push({ key, value }));
  return {
    protocol: u.protocol,
    username: u.username,
    password: u.password,
    hostname: u.hostname,
    port: u.port,
    pathname: u.pathname,
    hash: u.hash,
    params,
  };
}

// Rebuilds a URL from its parts. `params` is an array of { key, value }; blank keys are skipped.
export function buildUrl({ protocol = 'https:', username = '', password = '', hostname, port = '', pathname = '/', hash = '', params = [] }) {
  if (!hostname) throw new Error('A link needs a host name, such as example.com.');
  const base = `${protocol.replace(/:?$/, ':')}//${username ? encodeURIComponent(username) + (password ? ':' + encodeURIComponent(password) : '') + '@' : ''}${hostname}${port ? ':' + port : ''}`;
  let u;
  try { u = new URL(base); } catch { throw new Error('The protocol, host name or port is not valid.'); }
  u.pathname = pathname || '/';
  const kept = params.filter(p => p.key && p.key.trim() !== '');
  u.search = '';
  for (const p of kept) u.searchParams.append(p.key.trim(), p.value ?? '');
  u.hash = hash ? (hash.startsWith('#') ? hash : '#' + hash) : '';
  return u.toString();
}

// ---- Random table data ----
export const COLUMN_TYPES = {
  uuid: { label: 'UUID', make: () => uuidV4() },
  integer: { label: 'Integer (1 to 1000)', make: () => String(1 + Math.floor(Math.random() * 1000)) },
  decimal: { label: 'Decimal (0 to 1000)', make: () => (Math.random() * 1000).toFixed(2) },
  firstName: { label: 'First name', make: () => pick(FIRST) },
  lastName: { label: 'Last name', make: () => pick(LAST) },
  email: { label: 'Email (example.com)', make: () => `${pick(FIRST).toLowerCase()}.${pick(LAST).toLowerCase()}${Math.floor(Math.random() * 100)}@example.com` },
  word: { label: 'Word', make: () => pick(WORDS) },
  boolean: { label: 'True or false', make: () => (Math.random() < 0.5 ? 'true' : 'false') },
  date: { label: 'Date (2000 to 2030)', make: () => randomDate() },
  phone: { label: 'Phone (555 numbers)', make: () => `555-${String(1000 + Math.floor(Math.random() * 9000))}` },
};

const FIRST = ['Ava','Liam','Noah','Emma','Olivia','Mia','Ethan','Lucas','Amelia','Sofia','Aarav','Isha','Kabir','Ananya','Rohan','Priya','Arjun','Meera','Leo','Zara','Yuki','Hiro','Mei','Chen','Omar','Layla','Diego','Lucia'];
const LAST = ['Smith','Patel','Garcia','Kim','Nguyen','Khan','Silva','Rossi','Mueller','Tanaka','Singh','Lopez','Brown','Wilson','Martin','Rao','Das','Ali','Novak','Moreau','Costa','Park'];
const WORDS = ['alpha','beta','gamma','delta','ready','pending','north','south','blue','green','sample','test','lorem','ipsum','river','stone','cloud','apple','ember','quiet'];

const pick = list => list[Math.floor(Math.random() * list.length)];

function randomDate() {
  const start = Date.UTC(2000, 0, 1), end = Date.UTC(2030, 11, 31);
  const d = new Date(start + Math.floor(Math.random() * (end - start)));
  return d.toISOString().slice(0, 10);
}

export function validateTable({ types, rows }) {
  if (!Array.isArray(types) || types.length < 1 || types.length > MAX_COLUMNS) throw new Error(`Use from 1 to ${MAX_COLUMNS} columns.`);
  for (const t of types) if (!COLUMN_TYPES[t]) throw new Error(`Unknown column type: ${t}.`);
  const n = Number(rows);
  if (!Number.isInteger(n) || n < 1 || n > MAX_ROWS) throw new Error(`Use from 1 to ${MAX_ROWS.toLocaleString()} rows.`);
  return n;
}

// CSV cell escaping: quote when the value has a comma, quote, or line break
export function csvCell(v) {
  const s = String(v);
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

// Produces the file in chunks of `chunkRows` rows, so a million rows never needs one giant string
export function* tableChunks({ types, rows, format = 'csv', header = true, chunkRows = 5000 }) {
  const n = validateTable({ types, rows });
  const names = types.map(t => COLUMN_TYPES[t].label.split(' (')[0].replace(/\s+/g, '_').toLowerCase());
  if (format === 'csv') {
    if (header) yield names.map(csvCell).join(',') + '\n';
    for (let start = 0; start < n; start += chunkRows) {
      const end = Math.min(n, start + chunkRows);
      let s = '';
      for (let r = start; r < end; r++) {
        s += types.map(t => csvCell(COLUMN_TYPES[t].make())).join(',') + '\n';
      }
      yield s;
    }
  } else if (format === 'json') {
    yield '[\n';
    for (let start = 0; start < n; start += chunkRows) {
      const end = Math.min(n, start + chunkRows);
      let s = '';
      for (let r = start; r < end; r++) {
        const obj = {};
        types.forEach((t, i) => {
          const raw = COLUMN_TYPES[t].make();
          obj[names[i]] = t === 'integer' || t === 'decimal' ? Number(raw) : t === 'boolean' ? raw === 'true' : raw;
        });
        s += '  ' + JSON.stringify(obj) + (r < n - 1 ? ',' : '') + '\n';
      }
      yield s;
    }
    yield ']\n';
  } else {
    throw new Error('Choose CSV or JSON.');
  }
}

// Small sample for the preview table
export function sampleRows(types, count = 20) {
  return Array.from({ length: Math.min(count, MAX_ROWS) }, () => types.map(t => COLUMN_TYPES[t].make()));
}
