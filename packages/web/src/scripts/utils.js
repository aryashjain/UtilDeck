export function initTheme(themeToggle) {
  const THEME_KEY = 'toolkit_theme';
  const savedTheme = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = savedTheme === 'dark' || (savedTheme === null && prefersDark);

  if (isDark) {
    document.documentElement.classList.add('dark-mode');
    themeToggle.textContent = '☀️';
  } else {
    themeToggle.textContent = '🌙';
  }

  themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark-mode');
    const isDark = document.documentElement.classList.contains('dark-mode');
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
  });
}

export function generateId() {
  return Math.random().toString(36).substring(2, 11);
}

// Briefly swap a button's label, then restore the original text
export function flashButton(button, message) {
  const original = button.dataset.original || (button.dataset.original = button.textContent);
  button.textContent = message;
  setTimeout(() => {
    button.textContent = original;
  }, 2000);
}

export async function copyText(text, button) {
  if (!text) {
    flashButton(button, 'Nothing to copy');
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    flashButton(button, '✓ Copied');
  } catch (err) {
    console.error('Copy failed:', err);
    flashButton(button, 'Copy failed');
  }
}

// Parses a JSON response, or returns null when the body isn't JSON (e.g. a plain 404 page)
export async function readJson(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
