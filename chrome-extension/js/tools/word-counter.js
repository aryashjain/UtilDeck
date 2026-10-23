import { el, stat } from '../lib/ui.js';

function readingTime(words) {
  if (words === 0) return '0 sec';
  const seconds = Math.round((words / 200) * 60);
  return seconds < 60 ? `${seconds} sec` : `${Math.round(seconds / 6) / 10} min`;
}

export default {
  id: 'word-counter',
  name: 'Word Counter',
  group: 'Text',
  icon: 'Wc',
  desc: 'Words, characters, sentences, paragraphs and reading time.',
  render(root) {
    const input = el('textarea', { class: 'area', rows: 12, placeholder: 'Paste or type your text here…', spellcheck: 'false' });
    const stats = el('div', { class: 'stats' });

    const update = () => {
      const text = input.value;
      const trimmed = text.trim();
      const words = trimmed ? trimmed.split(/\s+/).length : 0;
      const sentences = trimmed ? (trimmed.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || []).filter((s) => s.trim()).length : 0;
      const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter((p) => p.trim()).length : 0;
      stats.replaceChildren(
        stat('Words', words),
        stat('Characters', [...text].length),
        stat('No spaces', [...text.replace(/\s/g, '')].length),
        stat('Sentences', sentences),
        stat('Paragraphs', paragraphs),
        stat('Reading time', readingTime(words)),
      );
    };

    input.addEventListener('input', update);
    root.append(input, stats);
    update();
  },
};
