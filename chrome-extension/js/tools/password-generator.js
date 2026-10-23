import { el, copy, resultRow, stat } from '../lib/ui.js';

const SETS = {
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower: 'abcdefghijklmnopqrstuvwxyz',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.?/',
};

// Uniform random integer in [0, max) from crypto.getRandomValues, without modulo bias.
function randomInt(max) {
  const limit = Math.floor(0x100000000 / max) * max;
  const buf = new Uint32Array(1);
  do {
    crypto.getRandomValues(buf);
  } while (buf[0] >= limit);
  return buf[0] % max;
}

function generate(length, enabled) {
  const pools = Object.keys(SETS).filter((k) => enabled[k]).map((k) => SETS[k]);
  const all = pools.join('');
  // One character from each chosen set guarantees every set appears, then the rest are random.
  const chars = pools.map((p) => p[randomInt(p.length)]);
  while (chars.length < length) chars.push(all[randomInt(all.length)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

// Rough strength from the size of the character pool and the length.
function strength(length, poolSize) {
  const bits = length * Math.log2(poolSize || 1);
  if (bits < 40) return { label: 'Weak', percent: 20, color: '#dc2626' };
  if (bits < 60) return { label: 'Fair', percent: 45, color: '#f59e0b' };
  if (bits < 80) return { label: 'Strong', percent: 75, color: '#16a34a' };
  return { label: 'Very strong', percent: 100, color: '#059669' };
}

export default {
  id: 'password-generator',
  name: 'Password Generator',
  group: 'Everyday',
  icon: '**',
  desc: 'Strong random passwords from your browser’s secure random source.',
  render(root) {
    let length = 20;
    const enabled = { upper: true, lower: true, digits: true, symbols: true };

    const slider = el('input', { type: 'range', min: 8, max: 64, value: length, class: 'slider' });
    const lengthLabel = el('span', { text: String(length) });
    const output = el('textarea', { class: 'area', rows: 2, readonly: true, spellcheck: 'false' });
    const meter = el('div', { class: 'bar' }, el('span', { style: 'width:0%' }));
    const strengthLabel = el('p', { class: 'status' });
    const details = el('div', { class: 'stats' });
    const extra = el('div', { class: 'tool' });

    const refresh = () => {
      const active = Object.keys(SETS).filter((k) => enabled[k]);
      const pool = active.reduce((n, k) => n + SETS[k].length, 0);
      if (!active.length) {
        output.value = '';
        strengthLabel.textContent = 'Pick at least one character type.';
        details.replaceChildren();
        extra.replaceChildren();
        return;
      }
      const password = generate(length, enabled);
      output.value = password;
      const s = strength(length, pool);
      meter.firstChild.style.width = `${s.percent}%`;
      meter.firstChild.style.background = s.color;
      strengthLabel.textContent = `${s.label} · about ${Math.round(length * Math.log2(pool))} bits of entropy`;
      details.replaceChildren(stat('Length', length), stat('Character types', active.length), stat('Pool size', pool));
      extra.replaceChildren(
        ...Array.from({ length: 4 }, () => resultRow('Alternative', generate(length, enabled))));
    };

    slider.addEventListener('input', () => {
      length = Number(slider.value);
      lengthLabel.textContent = String(length);
      refresh();
    });

    const toggles = Object.keys(SETS).map((key) => {
      const box = el('input', { type: 'checkbox', checked: enabled[key] });
      box.addEventListener('change', () => {
        enabled[key] = box.checked;
        refresh();
      });
      return el('label', { class: 'check' }, box, key[0].toUpperCase() + key.slice(1));
    });

    root.append(
      el('div', { class: 'card' },
        el('div', { class: 'toolbar' }, el('span', { class: 'field' }, 'Length'), slider, lengthLabel),
        el('div', { class: 'toolbar', style: 'margin-top:10px' }, ...toggles)),
      output,
      meter,
      strengthLabel,
      el('div', { class: 'toolbar' },
        el('button', { class: 'btn primary', onclick: () => copy(output.value, 'Password copied') }, 'Copy'),
        el('button', { class: 'btn', onclick: refresh }, 'Regenerate')),
      details,
      extra,
    );
    refresh();
  },
};
