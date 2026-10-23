import { el, copy, resultRow, seg } from '../lib/ui.js';

// Numbers of 1e11 or more are milliseconds (that is year 5138 in seconds), otherwise seconds.
function parseWhen(text) {
  const value = text.trim();
  if (!value) return null;
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    const n = Number(value);
    return new Date(Math.abs(n) >= 1e11 ? n : n * 1000);
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function relative(date) {
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const units = [['year', 31536000], ['month', 2592000], ['day', 86400], ['hour', 3600], ['minute', 60], ['second', 1]];
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size || unit === 'second') return rtf.format(Math.round(seconds / size), unit);
  }
  return '';
}

export default {
  id: 'uuid-time',
  name: 'UUID & Timestamp',
  group: 'Developer',
  icon: 'Id',
  desc: 'Generate UUIDs and convert between Unix time, ISO dates and local time.',
  render(root) {
    let count = 1;

    const uuids = el('textarea', { class: 'area', rows: 4, readonly: true, spellcheck: 'false' });
    const generate = () => {
      uuids.value = Array.from({ length: count }, () => crypto.randomUUID()).join('\n');
    };
    const uuidCard = el('div', { class: 'card' },
      el('h2', { text: 'UUID v4' }),
      el('div', { class: 'toolbar' },
        seg([[1, '1'], [5, '5'], [10, '10']], count, (v) => { count = v; generate(); }),
        el('button', { class: 'btn primary', onclick: generate }, 'Generate'),
        el('button', { class: 'btn', onclick: () => copy(uuids.value, 'UUIDs copied') }, 'Copy')),
      uuids);

    const nowRows = el('div', { class: 'tool' });
    const tick = () => {
      const now = new Date();
      nowRows.replaceChildren(
        resultRow('Unix seconds', String(Math.floor(now / 1000))),
        resultRow('Unix milliseconds', String(now.getTime())),
        resultRow('ISO 8601 (UTC)', now.toISOString()));
    };
    const clock = el('div', { class: 'card' }, el('h2', { text: 'Now' }), nowRows);

    const input = el('input', { class: 'input', type: 'text', placeholder: '1700000000, 1700000000000 or 2024-01-15T10:30:00Z', spellcheck: 'false' });
    const convert = el('div', { class: 'tool' });
    const update = () => {
      const date = parseWhen(input.value);
      if (!input.value.trim()) {
        convert.replaceChildren();
        return;
      }
      if (!date) {
        convert.replaceChildren(el('p', { class: 'status bad', text: 'Not a Unix time or a recognised date.' }));
        return;
      }
      convert.replaceChildren(
        resultRow('Unix seconds', String(Math.floor(date / 1000))),
        resultRow('Unix milliseconds', String(date.getTime())),
        resultRow('ISO 8601 (UTC)', date.toISOString()),
        resultRow('Local time', date.toLocaleString()),
        resultRow('Relative', relative(date)));
    };
    input.addEventListener('input', update);
    const convertCard = el('div', { class: 'card' },
      el('h2', { text: 'Convert' }),
      el('div', { class: 'toolbar' }, input, el('button', { class: 'btn', onclick: () => { input.value = String(Math.floor(Date.now() / 1000)); update(); } }, 'Use now')),
      convert);

    root.append(uuidCard, clock, convertCard);
    generate();
    tick();
    update();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  },
};
