import { el, copy, stat } from '../lib/ui.js';

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export default {
  id: 'find-replace',
  name: 'Find & Replace',
  group: 'Text',
  icon: '.*',
  desc: 'Replace text in bulk, with optional regular expressions and live match count.',
  render(root) {
    const source = el('textarea', { class: 'area', rows: 6, placeholder: 'Your text…', spellcheck: 'false' });
    const find = el('input', { class: 'input', type: 'text', placeholder: 'Find', spellcheck: 'false' });
    const replace = el('input', { class: 'input', type: 'text', placeholder: 'Replace with', spellcheck: 'false' });
    const useRegex = el('input', { type: 'checkbox' });
    const matchCase = el('input', { type: 'checkbox' });
    const output = el('textarea', { class: 'area', rows: 6, readonly: true, spellcheck: 'false' });
    const counts = el('div', { class: 'stats' });
    const error = el('p', { class: 'status bad' });

    const update = () => {
      error.textContent = '';
      if (!find.value) {
        output.value = source.value;
        counts.replaceChildren(stat('Matches', 0));
        return;
      }
      let re;
      try {
        re = new RegExp(useRegex.checked ? find.value : escapeRegExp(find.value), matchCase.checked ? 'g' : 'gi');
      } catch (e) {
        error.textContent = `Invalid pattern: ${e.message}`;
        return;
      }
      const matches = [...source.value.matchAll(re)].length;
      output.value = useRegex.checked
        ? source.value.replace(re, replace.value)
        : source.value.replace(re, () => replace.value);
      counts.replaceChildren(stat('Matches', matches));
    };

    for (const node of [source, find, replace]) node.addEventListener('input', update);
    for (const node of [useRegex, matchCase]) node.addEventListener('change', update);

    root.append(
      source,
      el('div', { class: 'grid-2' }, find, replace),
      el('div', { class: 'toolbar' },
        el('label', { class: 'check' }, useRegex, 'Regular expression'),
        el('label', { class: 'check' }, matchCase, 'Match case')),
      error,
      counts,
      output,
      el('div', { class: 'toolbar' },
        el('button', { class: 'btn primary', onclick: () => copy(output.value, 'Result copied') }, 'Copy result')),
    );
    update();
  },
};
