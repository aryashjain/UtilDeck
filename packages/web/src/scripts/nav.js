import { NOTEPAD, searchTools } from './tools.js';

const SITE_ROOT = new URL('../', import.meta.url);
const MAX_RESULTS = 8;
const REQUEST_PAGE = 'pages/request.html';

const toUrl = path => new URL(path, SITE_ROOT).href;
const pathOf = path => new URL(path, SITE_ROOT).pathname;
const escapeHtml = text => text.replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[c]);

// Renders the sticky nav bar into #toolNav: Home, Notepad and a search box.
// Tool pages get a dropdown of matching tools. The landing page passes onQuery
// instead, so the search filters its tool grid live.
export function initNav({ onQuery } = {}) {
  const nav = document.getElementById('toolNav');
  if (!nav) return;

  const here = location.pathname;
  const isHome = here === SITE_ROOT.pathname || here === pathOf('index.html');
  const isNotepad = here === pathOf(NOTEPAD.path);
  const isRequest = here === pathOf(REQUEST_PAGE);

  nav.innerHTML = `
    <div class="container nav-inner">
      <a class="nav-link${isHome ? ' active' : ''}" href="${toUrl('index.html')}">🏠 Home</a>
      <a class="nav-link${isNotepad ? ' active' : ''}" href="${toUrl(NOTEPAD.path)}">📋 Notepad</a>
      <a class="nav-link${isRequest ? ' active' : ''}" href="${toUrl(REQUEST_PAGE)}">💡 Request a tool</a>
      <div class="nav-search">
        <label class="visually-hidden" for="toolSearch">Search tools</label>
        <input type="search" id="toolSearch" role="combobox" placeholder="Search tools…"
          autocomplete="off" spellcheck="false" aria-expanded="false" aria-controls="toolSearchResults">
        <kbd class="nav-search-hint" aria-hidden="true">/</kbd>
        <ul id="toolSearchResults" class="search-results" role="listbox" hidden></ul>
      </div>
    </div>`;

  const input = nav.querySelector('#toolSearch');
  const list = nav.querySelector('#toolSearchResults');
  const searchBox = nav.querySelector('.nav-search');
  let results = [];
  let active = 0;

  function close() {
    list.hidden = true;
    input.setAttribute('aria-expanded', 'false');
  }

  function highlight() {
    list.querySelectorAll('[role="option"]').forEach((li, i) => {
      li.setAttribute('aria-selected', String(i === active));
    });
  }

  function renderDropdown() {
    const query = input.value.trim();
    results = query ? searchTools(query).slice(0, MAX_RESULTS) : [];
    active = 0;

    if (!query) return close();

    list.innerHTML = results.length
      ? results.map((tool, i) => `
          <li role="option" data-index="${i}">
            <a href="${toUrl(tool.path)}">
              <span class="search-result-icon">${escapeHtml(tool.icon)}</span>
              <span class="search-result-text">
                <span class="search-result-name">${escapeHtml(tool.name)}</span>
                <span class="search-result-desc">${escapeHtml(tool.description)}</span>
              </span>
            </a>
          </li>`).join('')
      : `<li class="search-empty">
          No tools match “${escapeHtml(query)}”.
          <a class="search-request" href="${toUrl(REQUEST_PAGE)}?tool=${encodeURIComponent(query)}">Request a tool</a>
        </li>`;

    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    highlight();
  }

  input.addEventListener('input', () => {
    if (onQuery) onQuery(input.value);
    else renderDropdown();
  });

  input.addEventListener('focus', () => {
    if (!onQuery && input.value.trim()) renderDropdown();
  });

  input.addEventListener('keydown', e => {
    if (onQuery) {
      if (e.key === 'Enter') input.blur();
      if (e.key === 'Escape') {
        input.value = '';
        onQuery('');
        input.blur();
      }
      return;
    }

    if (list.hidden) {
      if (e.key === 'Escape') input.blur();
      return;
    }

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (results.length) {
        const step = e.key === 'ArrowDown' ? 1 : -1;
        active = (active + step + results.length) % results.length;
        highlight();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[active]) window.location.href = toUrl(results[active].path);
    } else if (e.key === 'Escape') {
      close();
    }
  });

  list.addEventListener('mouseover', e => {
    const item = e.target.closest('[role="option"]');
    if (!item) return;
    active = Number(item.dataset.index);
    highlight();
  });

  document.addEventListener('mousedown', e => {
    if (!searchBox.contains(e.target)) close();
  });

  // Press "/" anywhere (outside a text field) to jump to search
  document.addEventListener('keydown', e => {
    if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
    const target = e.target;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) return;
    e.preventDefault();
    input.focus();
    input.select();
  });

  if (onQuery) {
    input.value = new URLSearchParams(location.search).get('q') || '';
    onQuery(input.value);
  }
}
