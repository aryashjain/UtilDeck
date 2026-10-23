import { el, copy, seg } from '../lib/ui.js';

const sortKeys = (value) => {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((k) => [k, sortKeys(value[k])]));
  }
  return value;
};

// Chrome's messages already say "line x column y" in newer versions; add it only when missing.
function location(message, text) {
  if (/line \d+/.test(message)) return '';
  const match = message.match(/position (\d+)/);
  if (!match) return '';
  const before = text.slice(0, Number(match[1])).split('\n');
  return ` (line ${before.length}, column ${before[before.length - 1].length + 1})`;
}

export default {
  id: 'json-formatter',
  name: 'JSON Formatter',
  group: 'Developer',
  icon: '{}',
  desc: 'Format, minify, sort keys and validate JSON with clear error positions.',
  render(root) {
    let mode = 'format';
    let indent = '2';
    let sort = false;

    const input = el('textarea', { class: 'area', rows: 10, placeholder: '{"paste": "your JSON here"}', spellcheck: 'false' });
    const output = el('textarea', { class: 'area', rows: 10, readonly: true, spellcheck: 'false' });
    const status = el('p', { class: 'status' });

    const run = () => {
      const text = input.value;
      if (!text.trim()) {
        output.value = '';
        status.className = 'status';
        status.textContent = 'Paste JSON to start.';
        return;
      }
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        output.value = '';
        status.className = 'status bad';
        status.textContent = `Invalid JSON: ${e.message}${location(e.message, text)}`;
        return;
      }
      if (sort) data = sortKeys(data);
      output.value = mode === 'minify'
        ? JSON.stringify(data)
        : JSON.stringify(data, null, indent === 'tab' ? '\t' : Number(indent));
      status.className = 'status good';
      status.textContent = `Valid JSON · ${text.length.toLocaleString()} characters in, ${output.value.length.toLocaleString()} out`;
    };

    input.addEventListener('input', run);

    const sortBox = el('input', { type: 'checkbox', onchange: (e) => { sort = e.target.checked; run(); } });

    root.append(
      input,
      el('div', { class: 'toolbar' },
        seg([['format', 'Format'], ['minify', 'Minify']], mode, (v) => { mode = v; run(); }),
        seg([['2', '2 spaces'], ['4', '4 spaces'], ['tab', 'Tab']], indent, (v) => { indent = v; run(); }),
        el('label', { class: 'check' }, sortBox, 'Sort keys')),
      status,
      output,
      el('div', { class: 'toolbar' },
        el('button', { class: 'btn primary', onclick: () => copy(output.value, 'JSON copied') }, 'Copy output')),
    );
    run();
  },
};
