import { el, stat } from '../lib/ui.js';

const MAX_CELLS = 4_000_000; // about 2000 x 2000 lines; keeps the browser responsive

// Line-by-line diff using a longest-common-subsequence table.
function diffLines(a, b) {
  const n = a.length;
  const m = b.length;
  const table = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      table[i][j] = a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }
  const out = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { out.push([' ', a[i]]); i++; j++; }
    else if (table[i + 1][j] >= table[i][j + 1]) { out.push(['-', a[i]]); i++; }
    else { out.push(['+', b[j]]); j++; }
  }
  while (i < n) out.push(['-', a[i++]]);
  while (j < m) out.push(['+', b[j++]]);
  return out;
}

export default {
  id: 'text-diff',
  name: 'Text Diff',
  group: 'Text',
  icon: '±',
  desc: 'Compare two texts line by line and see what was added or removed.',
  render(root) {
    const before = el('textarea', { class: 'area', rows: 10, placeholder: 'Original text…', spellcheck: 'false' });
    const after = el('textarea', { class: 'area', rows: 10, placeholder: 'Changed text…', spellcheck: 'false' });
    const stats = el('div', { class: 'stats' });
    const box = el('div', { class: 'diff-box' });

    const update = () => {
      const a = before.value.split('\n');
      const b = after.value.split('\n');
      if (!before.value && !after.value) {
        stats.replaceChildren();
        box.replaceChildren(el('p', { class: 'status', text: 'Paste both texts to see the differences.' }));
        return;
      }
      if (a.length * b.length > MAX_CELLS) {
        box.replaceChildren(el('p', { class: 'status bad', text: 'These texts are too long to compare here.' }));
        return;
      }
      const diff = diffLines(a, b);
      const added = diff.filter(([t]) => t === '+').length;
      const removed = diff.filter(([t]) => t === '-').length;
      stats.replaceChildren(stat('Added lines', added), stat('Removed lines', removed), stat('Unchanged', diff.length - added - removed));
      box.replaceChildren(...diff.map(([type, text]) => {
        const cls = type === '+' ? 'add' : type === '-' ? 'del' : '';
        return el('div', { class: `diff-line ${cls}`, text: `${type} ${text}` });
      }));
    };

    before.addEventListener('input', update);
    after.addEventListener('input', update);
    root.append(el('div', { class: 'grid-2' }, before, after), stats, box);
    update();
  },
};
