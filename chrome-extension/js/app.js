import { TOOLS } from './tools/index.js';
import { el } from './lib/ui.js';

const $ = (id) => document.getElementById(id);
const nav = $('nav');
const search = $('search');
const panel = $('tool');
const themeBtn = $('theme');

let currentId = null;
let cleanup = null;

// Theme: auto follows the system setting, or force light or dark.
const THEME_KEY = 'utildeck-theme';
const THEME_ORDER = ['auto', 'light', 'dark'];
const systemDark = matchMedia('(prefers-color-scheme: dark)');

function applyTheme() {
  const pref = localStorage.getItem(THEME_KEY) || 'auto';
  const resolved = pref === 'auto' ? (systemDark.matches ? 'dark' : 'light') : pref;
  document.documentElement.dataset.theme = resolved;
  themeBtn.textContent = `Theme: ${pref[0].toUpperCase()}${pref.slice(1)}`;
}

themeBtn.addEventListener('click', () => {
  const pref = localStorage.getItem(THEME_KEY) || 'auto';
  localStorage.setItem(THEME_KEY, THEME_ORDER[(THEME_ORDER.indexOf(pref) + 1) % THEME_ORDER.length]);
  applyTheme();
});
systemDark.addEventListener('change', applyTheme);
applyTheme();

function markActive() {
  for (const link of nav.querySelectorAll('.nav-item')) {
    link.classList.toggle('active', link.dataset.id === currentId);
  }
}

function renderNav(query = '') {
  const q = query.trim().toLowerCase();
  nav.replaceChildren();
  let group = null;
  for (const tool of TOOLS) {
    const haystack = `${tool.name} ${tool.desc} ${tool.group}`.toLowerCase();
    if (q && !haystack.includes(q)) continue;
    if (tool.group !== group) {
      group = tool.group;
      nav.append(el('p', { class: 'nav-group', text: group }));
    }
    nav.append(el('a', { class: 'nav-item', href: `#${tool.id}`, 'data-id': tool.id },
      el('span', { class: 'nav-icon', text: tool.icon }),
      el('span', { text: tool.name })));
  }
  if (!nav.querySelector('.nav-item')) nav.append(el('p', { class: 'nav-empty', text: 'No tools match.' }));
  markActive();
}

function openTool(id) {
  const tool = TOOLS.find((t) => t.id === id) || TOOLS[0];
  cleanup?.();
  cleanup = null;
  currentId = tool.id;
  $('tool-title').textContent = tool.name;
  $('tool-desc').textContent = tool.desc;
  document.title = `${tool.name} · UtilDeck`;
  panel.replaceChildren();
  cleanup = tool.render(panel) || null;
  markActive();
  panel.querySelector('textarea, input')?.focus();
}

search.addEventListener('input', () => renderNav(search.value));
search.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    nav.querySelector('.nav-item')?.click();
    search.blur();
  }
  if (e.key === 'Escape') {
    search.value = '';
    renderNav();
    search.blur();
  }
});

document.addEventListener('keydown', (e) => {
  const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '');
  if (e.key === '/' && !typing) {
    e.preventDefault();
    search.focus();
  }
});

window.addEventListener('hashchange', () => openTool(location.hash.slice(1)));

renderNav();
openTool(location.hash.slice(1));
