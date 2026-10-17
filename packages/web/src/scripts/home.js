import { CATEGORIES, NOTEPAD, TOOLS, searchTools } from './tools.js';
import { initNav } from './nav.js';
import { initTheme } from './utils.js';

initTheme(document.getElementById('themeToggle'));

const sectionsEl = document.getElementById('toolSections');
const countEl = document.getElementById('resultCount');
const emptyEl = document.getElementById('emptyState');
const deckEl = document.getElementById('deck');
const indexEl = document.getElementById('categoryIndex');

const ALL_TOOLS = [NOTEPAD, ...TOOLS];

const SECTIONS = [
  { name: 'Featured', items: [NOTEPAD] },
  ...CATEGORIES.map(category => ({
    name: category.name,
    items: TOOLS.filter(tool => tool.category === category.id),
  })),
];

// The hero deck: one card image per tool, in registry order.
// Each image is named after its page, e.g. pages/word-counter.html -> assets/cards/word-counter.png
const cardImage = tool => `assets/cards/${tool.path.split('/').pop().replace('.html', '.png')}`;

deckEl.innerHTML = ALL_TOOLS
  .map(tool => `
    <a class="deck-card" href="${tool.path}" title="${tool.description}">
      <img src="${cardImage(tool)}" alt="${tool.name} card" width="338" height="471" loading="lazy" draggable="false">
    </a>`)
  .join('');

const escapeText = text => text.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const sectionId = name => `cat-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

// Search text, and which button is picked: null until one is pressed, then 'all' or a section id
let query = '';
let selected = null;

function card(tool) {
  return `
    <a class="tool-card" href="${tool.path}">
      <span class="tool-card-icon" aria-hidden="true">${tool.icon}</span>
      <h3>${tool.name}</h3>
      <p>${tool.description}</p>
    </a>`;
}

function chip(id, label, count, pressed) {
  return `<button type="button" class="category-chip" data-target="${id}" aria-pressed="${pressed}">${label} <span>${count}</span></button>`;
}

function render() {
  const trimmed = query.trim();
  const matchPaths = new Set((trimmed ? searchTools(trimmed) : ALL_TOOLS).map(tool => tool.path));

  const sections = SECTIONS
    .map(section => ({
      id: sectionId(section.name),
      name: section.name,
      visibleItems: section.items.filter(tool => matchPaths.has(tool.path)),
    }))
    .filter(section => section.visibleItems.length > 0);

  // While searching, every matching section shows. Otherwise only the picked one does.
  const showAll = trimmed !== '' || selected === 'all';
  const shown = sections.filter(section => showAll || section.id === selected);
  const shownCount = shown.reduce((total, section) => total + section.visibleItems.length, 0);

  indexEl.innerHTML = [
    matchPaths.size > 0 ? chip('all', 'All tools', matchPaths.size, selected === 'all') : '',
    ...sections.map(section => chip(section.id, section.name, section.visibleItems.length, selected === section.id)),
  ].join('');

  if (!trimmed && selected === null) {
    sectionsEl.innerHTML = '<p class="pick-hint">Pick a category above, or press <strong>All tools</strong> to see everything.</p>';
  } else {
    sectionsEl.innerHTML = shown
      .map(section => `
        <section class="tool-section" id="${section.id}">
          <h2 class="tool-section-title">${section.name}</h2>
          <div class="tool-grid">${section.visibleItems.map(card).join('')}</div>
        </section>`)
      .join('');
  }

  if (trimmed) {
    countEl.textContent = `${matchPaths.size} of ${ALL_TOOLS.length} tools match “${trimmed}”`;
  } else {
    countEl.textContent = selected === null ? '' : `${shownCount} of ${ALL_TOOLS.length} tools`;
  }

  emptyEl.hidden = !(trimmed && matchPaths.size === 0);
  emptyEl.innerHTML = `No tools match “${escapeText(trimmed)}”. Try a shorter word, like “count” or “json”.
    <p><a class="search-request" href="pages/request.html?tool=${encodeURIComponent(trimmed)}">Request this tool</a></p>`;
}

indexEl.addEventListener('click', e => {
  const button = e.target.closest('button[data-target]');
  if (!button) return;
  selected = button.dataset.target;
  render();
});

initNav({
  onQuery: text => {
    query = text;
    render();
  },
});
