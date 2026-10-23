import { el, resultRow } from '../lib/ui.js';

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return { r: Math.round(f(0) * 255), g: Math.round(f(8) * 255), b: Math.round(f(4) * 255) };
}

// Accepts #rgb, #rrggbb, rgb(...) and hsl(...). Returns null when it can't read the value.
function parseColor(text) {
  const value = text.trim();
  const hex = value.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const digits = hex[1].length === 3 ? [...hex[1]].map((c) => c + c).join('') : hex[1];
    return { r: parseInt(digits.slice(0, 2), 16), g: parseInt(digits.slice(2, 4), 16), b: parseInt(digits.slice(4, 6), 16) };
  }
  const rgb = value.match(/^rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})/i);
  if (rgb) return { r: clamp(+rgb[1], 0, 255), g: clamp(+rgb[2], 0, 255), b: clamp(+rgb[3], 0, 255) };
  const hsl = value.match(/^hsla?\(\s*([\d.]+)(?:deg)?[\s,]+([\d.]+)%?[\s,]+([\d.]+)%?/i);
  if (hsl) return hslToRgb(+hsl[1] % 360, clamp(+hsl[2], 0, 100), clamp(+hsl[3], 0, 100));
  return null;
}

const toHex = ({ r, g, b }) => '#' + [r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('');

export default {
  id: 'color-converter',
  name: 'Color Converter',
  group: 'Developer',
  icon: '◐',
  desc: 'Convert colors between HEX, RGB and HSL, or pick one visually.',
  render(root) {
    const text = el('input', { class: 'input', type: 'text', placeholder: '#7c6cff, rgb(124, 108, 255) or hsl(252, 100%, 71%)', spellcheck: 'false' });
    const picker = el('input', { type: 'color', value: '#7c6cff', class: 'swatch', 'aria-label': 'Pick a color' });
    const swatch = el('div', { class: 'swatch' });
    const error = el('p', { class: 'status bad' });
    const rows = el('div', { class: 'tool' });

    const show = (rgb) => {
      swatch.style.background = toHex(rgb);
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      rows.replaceChildren(
        resultRow('HEX', toHex(rgb).toUpperCase()),
        resultRow('RGB', `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`),
        resultRow('HSL', `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`));
    };

    text.addEventListener('input', () => {
      const rgb = parseColor(text.value);
      error.textContent = text.value.trim() && !rgb ? 'Use #hex, rgb(…) or hsl(…).' : '';
      if (rgb) {
        picker.value = toHex(rgb);
        show(rgb);
      } else {
        rows.replaceChildren();
      }
    });

    picker.addEventListener('input', () => {
      const rgb = parseColor(picker.value);
      text.value = picker.value;
      error.textContent = '';
      show(rgb);
    });

    root.append(
      el('div', { class: 'toolbar' }, picker, text),
      error,
      el('div', { class: 'card' }, el('h2', { text: 'Preview' }), swatch),
      rows,
    );
    text.value = '#7c6cff';
    show(parseColor('#7c6cff'));
  },
};
