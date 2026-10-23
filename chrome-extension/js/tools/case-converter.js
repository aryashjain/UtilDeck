import { el, resultRow } from '../lib/ui.js';

// Split text into words, including camelCase boundaries.
const words = (s) => s.replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, '$1 $2').split(/[^\p{L}\p{N}]+/u).filter(Boolean);
const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();

const FORMATS = [
  ['UPPER CASE', (s) => s.toUpperCase()],
  ['lower case', (s) => s.toLowerCase()],
  ['Title Case', (s) => s.toLowerCase().replace(/(^|[\s"(-])(\p{L})/gu, (m, p, c) => p + c.toUpperCase())],
  ['Sentence case', (s) => s.toLowerCase().replace(/(^\s*|[.!?]\s+)(\p{L})/gu, (m, p, c) => p + c.toUpperCase())],
  ['camelCase', (s) => words(s).map((w, i) => (i ? cap(w) : w.toLowerCase())).join('')],
  ['PascalCase', (s) => words(s).map(cap).join('')],
  ['snake_case', (s) => words(s).map((w) => w.toLowerCase()).join('_')],
  ['kebab-case', (s) => words(s).map((w) => w.toLowerCase()).join('-')],
  ['CONSTANT_CASE', (s) => words(s).map((w) => w.toUpperCase()).join('_')],
];

export default {
  id: 'case-converter',
  name: 'Case Converter',
  group: 'Text',
  icon: 'Aa',
  desc: 'Switch text between UPPER, lower, Title, camelCase, snake_case and more.',
  render(root) {
    const input = el('textarea', { class: 'area', rows: 5, placeholder: 'Type or paste text…', spellcheck: 'false' });
    const results = el('div', { class: 'tool' });

    const update = () => {
      const text = input.value;
      results.replaceChildren(...FORMATS.map(([label, convert]) =>
        resultRow(label, text ? convert(text) : '—')));
    };

    input.addEventListener('input', update);
    root.append(input, results);
    update();
  },
};
