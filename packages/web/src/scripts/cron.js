// Five-field cron: minute hour day-of-month month day-of-week. Supports *, lists (1,3), ranges (1-5), steps (*/15, 1-10/2).

const FIELDS = [
  { name: 'minute', min: 0, max: 59 },
  { name: 'hour', min: 0, max: 23 },
  { name: 'day of month', min: 1, max: 31 },
  { name: 'month', min: 1, max: 12 },
  { name: 'day of week', min: 0, max: 7 }, // 0 and 7 are both Sunday
];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Returns a Set of allowed values for one field, or throws a clear message
function parseField(text, { name, min, max }) {
  const values = new Set();
  for (const part of String(text).split(',')) {
    const m = /^(\*|\d+(?:-\d+)?)(?:\/(\d+))?$/.exec(part.trim());
    if (!m) throw new Error(`The ${name} field "${part}" is not valid.`);
    const step = m[2] ? Number(m[2]) : 1;
    if (!(step >= 1)) throw new Error(`The step in the ${name} field must be 1 or more.`);
    let lo, hi;
    if (m[1] === '*') { lo = min; hi = max; }
    else if (m[1].includes('-')) { [lo, hi] = m[1].split('-').map(Number); }
    else { lo = Number(m[1]); hi = m[2] ? max : lo; }
    if (lo < min || hi > max || lo > hi) throw new Error(`The ${name} field must be between ${min} and ${max}.`);
    for (let v = lo; v <= hi; v += step) values.add(v);
  }
  return values;
}

export function parseCron(expression) {
  const parts = String(expression).trim().split(/\s+/);
  if (parts.length !== 5) throw new Error('A cron expression has five fields: minute hour day-of-month month day-of-week.');
  const sets = parts.map((p, i) => parseField(p, FIELDS[i]));
  if (sets[4].has(7)) { sets[4].delete(7); sets[4].add(0); }
  return {
    minute: sets[0], hour: sets[1], dom: sets[2], month: sets[3], dow: sets[4],
    domStar: parts[2] === '*', dowStar: parts[4] === '*',
    raw: parts,
  };
}

// Day rule: if both day fields are restricted, a day matches when EITHER matches (standard cron behaviour)
function dayMatches(c, date) {
  const domOk = c.dom.has(date.getDate());
  const dowOk = c.dow.has(date.getDay());
  if (c.domStar && c.dowStar) return true;
  if (c.domStar) return dowOk;
  if (c.dowStar) return domOk;
  return domOk || dowOk;
}

// Next `count` run times after `from` (a Date), in the local time zone
export function nextRuns(expression, count = 5, from = new Date()) {
  const c = parseCron(expression);
  const runs = [];
  const d = new Date(from.getTime());
  d.setSeconds(0, 0);
  d.setMinutes(d.getMinutes() + 1);
  const limit = from.getTime() + 366 * 24 * 3600 * 1000;
  while (runs.length < count && d.getTime() <= limit) {
    if (c.month.has(d.getMonth() + 1) && dayMatches(c, d) && c.hour.has(d.getHours()) && c.minute.has(d.getMinutes())) {
      runs.push(new Date(d.getTime()));
    }
    d.setMinutes(d.getMinutes() + 1);
  }
  return runs;
}

const pad = n => String(n).padStart(2, '0');
const list = (set, label) => [...set].sort((a, b) => a - b).map(label).join(', ');

// Plain English for the expression
export function explainCron(expression) {
  const c = parseCron(expression);
  const [m, h, dom, mon, dow] = c.raw;
  let time;
  if (m === '*' && h === '*') time = 'Every minute';
  else if (/^\*\/\d+$/.test(m) && h === '*') time = `Every ${m.slice(2)} minutes`;
  else if (h === '*') time = `At minute ${list(c.minute, String)} of every hour`;
  else if (c.minute.size === 1 && c.hour.size === 1) time = `At ${pad([...c.hour][0])}:${pad([...c.minute][0])}`;
  else if (c.minute.size === 1) time = `At minute ${[...c.minute][0]} past ${list(c.hour, v => pad(v) + ':00')}`;
  else time = `At minutes ${list(c.minute, String)} past hours ${list(c.hour, String)}`;
  if (/^\*\/\d+$/.test(h) && c.minute.size === 1) time = `At minute ${[...c.minute][0]} past every ${h.slice(2)} hours`;

  const parts = [time];
  if (dow !== '*') {
    const isWeekdays = c.dow.size === 5 && [1, 2, 3, 4, 5].every(d => c.dow.has(d));
    parts.push(isWeekdays ? 'on weekdays' : `on ${list(c.dow, v => DAY_NAMES[v])}`);
  }
  if (dom !== '*') parts.push(`on day ${list(c.dom, String)} of the month`);
  if (mon !== '*') parts.push(`in ${list(c.month, v => MONTH_NAMES[v - 1])}`);
  return parts.join(' ') + '.';
}
