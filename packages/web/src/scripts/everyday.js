// Date calculator, dice and coin, and JWT decoding. Pure functions, checked directly.

// ---- Dates (calendar dates are read as UTC so time zones never shift a day) ----
const DAY_MS = 86400000;

export function parseDate(text) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(text).trim());
  if (!m) throw new Error('Use the format YYYY-MM-DD.');
  const ms = Date.UTC(+m[1], +m[2] - 1, +m[3]);
  const d = new Date(ms);
  if (d.getUTCFullYear() !== +m[1] || d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[3]) {
    throw new Error('That date does not exist.');
  }
  return ms;
}

// Whole days from a to b (negative when b is earlier)
export function daysBetween(startText, endText) {
  return Math.round((parseDate(endText) - parseDate(startText)) / DAY_MS);
}

// Working days (Monday to Friday) from a to b, not counting the start day, counting the end day
export function workingDaysBetween(startText, endText) {
  const start = parseDate(startText), end = parseDate(endText);
  const sign = end >= start ? 1 : -1;
  let count = 0;
  for (let t = start + sign * DAY_MS; sign > 0 ? t <= end : t >= end; t += sign * DAY_MS) {
    const dow = new Date(t).getUTCDay();
    if (dow !== 0 && dow !== 6) count += 1;
  }
  return sign * count;
}

export function addDays(startText, days) {
  const n = Number(days);
  if (!Number.isInteger(n)) throw new Error('Enter a whole number of days.');
  const d = new Date(parseDate(startText) + n * DAY_MS);
  return d.toISOString().slice(0, 10);
}

// Time left until a date and time, from `now` (a Date). Returns null once the moment has passed.
export function countdownParts(targetIso, now = new Date()) {
  const target = Date.parse(targetIso);
  if (Number.isNaN(target)) throw new Error('Enter a date and time.');
  const left = target - now.getTime();
  if (left <= 0) return null;
  const days = Math.floor(left / DAY_MS);
  const hours = Math.floor((left % DAY_MS) / 3600000);
  const minutes = Math.floor((left % 3600000) / 60000);
  const seconds = Math.floor((left % 60000) / 1000);
  return { days, hours, minutes, seconds };
}

// ---- Dice and coin (secure random source) ----
function randomBelow(limit) {
  const buffer = new Uint32Array(1);
  const cap = Math.floor(0x100000000 / limit) * limit;
  let x;
  do { globalThis.crypto.getRandomValues(buffer); x = buffer[0]; } while (x >= cap);
  return x % limit;
}

export function rollDice(sides, count) {
  const s = Number(sides), n = Number(count);
  if (!Number.isInteger(s) || s < 2 || s > 1000) throw new Error('Sides must be a whole number from 2 to 1000.');
  if (!Number.isInteger(n) || n < 1 || n > 100) throw new Error('Roll from 1 to 100 dice.');
  return Array.from({ length: n }, () => randomBelow(s) + 1);
}

export function flipCoins(count) {
  const n = Number(count);
  if (!Number.isInteger(n) || n < 1 || n > 1000) throw new Error('Flip from 1 to 1000 coins.');
  return Array.from({ length: n }, () => (randomBelow(2) === 0 ? 'Heads' : 'Tails'));
}

// ---- JWT (decodes only; the signature is NOT verified here) ----
function base64UrlToText(part) {
  const b64 = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '=');
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

export function decodeJwt(token, now = new Date()) {
  const parts = String(token).trim().split('.');
  if (parts.length !== 3) throw new Error('A JWT has three parts separated by dots.');
  let header, payload;
  try {
    header = JSON.parse(base64UrlToText(parts[0]));
    payload = JSON.parse(base64UrlToText(parts[1]));
  } catch (err) {
    throw new Error('The header or payload is not valid base64url JSON.');
  }
  const seconds = v => (typeof v === 'number' ? new Date(v * 1000).toISOString() : null);
  const nowSec = now.getTime() / 1000;
  return {
    header,
    payload,
    signature: parts[2],
    issuedAt: seconds(payload.iat),
    expiresAt: seconds(payload.exp),
    notBefore: seconds(payload.nbf),
    expired: typeof payload.exp === 'number' ? nowSec >= payload.exp : null,
  };
}
