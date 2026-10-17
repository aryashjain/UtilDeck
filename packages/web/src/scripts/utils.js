// Swaps the header logo and favicon to match the theme: light artwork on light, dark on dark
export function syncBrandIcons() {
  const dark = document.documentElement.classList.contains('dark-mode');
  const logo = document.querySelector('img.brand-logo');
  const icon = document.querySelector('link[rel="icon"]');
  const base = (logo?.getAttribute('src') || icon?.getAttribute('href') || '').replace(/[^/]*$/, '');
  const file = base + (dark ? 'dark-icon64.png' : 'light-icon64.png');
  if (logo) logo.src = file;
  if (icon) icon.href = file;
}

export function initTheme(themeToggle) {
  const THEME_KEY = 'toolkit_theme';
  const savedTheme = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = savedTheme === 'dark' || (savedTheme === null && prefersDark);

  if (isDark) {
    document.documentElement.classList.add('dark-mode');
  }
  syncBrandIcons();

  themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark-mode');
    const isDark = document.documentElement.classList.contains('dark-mode');
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
    syncBrandIcons();
  });
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
