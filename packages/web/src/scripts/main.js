import { NOTES_API, NOTES_UNAVAILABLE, NOTE_LIFETIME_HOURS } from './config.js';
import { copyText, readJson, syncBrandIcons } from './utils.js';

const NOTEPAD_KEY = 'toolkit_notepad_content';
const THEME_KEY = 'toolkit_theme';

const notepad = document.getElementById('notepad');
const themeToggle = document.getElementById('themeToggle');
const clearBtn = document.getElementById('clearBtn');
const exportTxtBtn = document.getElementById('exportTxtBtn');
const exportMdBtn = document.getElementById('exportMdBtn');

// Initialize theme
function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = savedTheme === 'dark' || (savedTheme === null && prefersDark);

  if (isDark) {
    document.documentElement.classList.add('dark-mode');
  } else {
  }
  syncBrandIcons();
}

// Toggle theme
themeToggle.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark-mode');
  const isDark = document.documentElement.classList.contains('dark-mode');
  localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  syncBrandIcons();
});

// Load saved notepad content
function loadNotepad() {
  const saved = localStorage.getItem(NOTEPAD_KEY);
  if (saved) {
    notepad.value = saved;
    updateStats();
  }
}

// Save notepad content
function saveNotepad() {
  localStorage.setItem(NOTEPAD_KEY, notepad.value);
}

notepad.addEventListener('input', () => {
  saveNotepad();
  updateStats();
});

// Calculate and update stats
function updateStats() {
  const text = notepad.value.trim();

  const wordCount = text ? text.split(/\s+/).length : 0;
  const charCount = notepad.value.length;
  const sentenceCount = text ? (text.match(/[.!?]+/g) || []).length : 0;
  const readingTime = Math.ceil(wordCount / 200); // 200 words per minute

  document.getElementById('wordCount').textContent = wordCount;
  document.getElementById('charCount').textContent = charCount;
  document.getElementById('sentenceCount').textContent = sentenceCount;
  document.getElementById('readingTime').textContent = readingTime + 'm';
}

// Clear notepad
clearBtn.addEventListener('click', () => {
  if (notepad.value && confirm('Are you sure? This will clear all content.')) {
    notepad.value = '';
    saveNotepad();
    updateStats();
  }
});

// Export as TXT
exportTxtBtn.addEventListener('click', () => {
  const text = notepad.value;
  const blob = new Blob([text], { type: 'text/plain' });
  downloadFile(blob, 'note.txt');
});

// Export as MD
exportMdBtn.addEventListener('click', () => {
  const text = notepad.value;
  const blob = new Blob([text], { type: 'text/markdown' });
  downloadFile(blob, 'note.md');
});

function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tabName = btn.dataset.tab;

    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    btn.classList.add('active');
    document.getElementById(tabName).classList.add('active');
  });
});

// Share: POST the note to the Worker and show a link that expires after NOTE_LIFETIME_HOURS
const passwordProtect = document.getElementById('passwordProtect');
const sharePassword = document.getElementById('sharePassword');
const generateShareBtn = document.getElementById('generateShareBtn');
const shareStatus = document.getElementById('shareStatus');
const shareLink = document.getElementById('shareLink');
const shareLinkInput = document.getElementById('shareLinkInput');
const copyLinkBtn = document.getElementById('copyLinkBtn');

function setShareStatus(message, isError = false) {
  shareStatus.textContent = message;
  shareStatus.classList.toggle('error', isError);
}

passwordProtect.addEventListener('change', () => {
  sharePassword.style.display = passwordProtect.checked ? 'block' : 'none';
});

generateShareBtn.addEventListener('click', async () => {
  const content = notepad.value;
  if (!content.trim()) {
    setShareStatus('Write something first, then create the link.', true);
    return;
  }
  const password = passwordProtect.checked ? sharePassword.value : null;
  if (passwordProtect.checked && !password) {
    setShareStatus('Enter a password, or untick Password protect.', true);
    return;
  }

  generateShareBtn.disabled = true;
  setShareStatus('Creating link…');
  try {
    const response = await fetch(NOTES_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, password }),
    });
    const data = await readJson(response);
    if (!data) throw new Error(NOTES_UNAVAILABLE);
    if (!response.ok) throw new Error(data.error || 'Could not create the link.');

    const url = new URL('note.html', window.location.href);
    url.searchParams.set('id', data.id);
    shareLinkInput.value = url.href;
    shareLink.style.display = 'flex';

    const expires = new Date(data.expiresAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    setShareStatus(`Link works for ${NOTE_LIFETIME_HOURS} hours, until ${expires}.`);
  } catch (error) {
    console.error('Share failed:', error);
    const unreachable = error instanceof TypeError;
    setShareStatus(unreachable ? 'Could not reach the notes server. Check your connection.' : error.message, true);
  } finally {
    generateShareBtn.disabled = false;
  }
});

copyLinkBtn.addEventListener('click', () => copyText(shareLinkInput.value, copyLinkBtn));

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  loadNotepad();
});
