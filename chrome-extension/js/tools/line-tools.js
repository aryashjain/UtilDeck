import { el, copy, stat } from '../lib/ui.js';

const lines = (text) => text.split('\n');

const shuffle = (items) => {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

const OPERATIONS = [
  ['Sort A → Z', (ls) => [...ls].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))],
  ['Sort Z → A', (ls) => [...ls].sort((a, b) => b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' }))],
  ['Reverse', (ls) => [...ls].reverse()],
  ['Shuffle', shuffle],
  ['Remove duplicates', (ls) => [...new Set(ls)]],
  ['Remove empty lines', (ls) => ls.filter((l) => l.trim())],
  ['Trim spaces', (ls) => ls.map((l) => l.trim())],
  ['Number lines', (ls) => ls.map((l, i) => `${i + 1}. ${l}`)],
];

export default {
  id: 'line-tools',
  name: 'Line Tools',
  group: 'Text',
  icon: '≡',
  desc: 'Sort, deduplicate, trim and clean up lines. Undo any step.',
  render(root) {
    const history = [];
    const input = el('textarea', { class: 'area', rows: 12, placeholder: 'One item per line…', spellcheck: 'false' });
    const stats = el('div', { class: 'stats' });
    const undo = el('button', { class: 'btn', onclick: () => {
      if (!history.length) return;
      input.value = history.pop();
      update();
    } }, 'Undo');

    const apply = (transform) => {
      history.push(input.value);
      input.value = transform(lines(input.value)).join('\n');
      update();
    };

    const update = () => {
      const count = input.value ? lines(input.value).length : 0;
      const unique = input.value ? new Set(lines(input.value)).size : 0;
      stats.replaceChildren(stat('Lines', count), stat('Unique', unique), stat('Characters', input.value.length));
      undo.disabled = history.length === 0;
    };

    input.addEventListener('input', update);
    root.append(
      input,
      el('div', { class: 'toolbar' },
        ...OPERATIONS.map(([label, transform]) =>
          el('button', { class: 'btn', onclick: () => apply(transform) }, label)),
        undo,
        el('button', { class: 'btn primary', onclick: () => copy(input.value, 'Lines copied') }, 'Copy')),
      stats,
    );
    update();
  },
};
