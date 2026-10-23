import { el, copy, seg } from '../lib/ui.js';

const toBase64 = (text) => {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
};

const fromBase64 = (text) => {
  const binary = atob(text.trim());
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
};

// DOMParser builds a document without running scripts, so it is safe for decoding.
const decodeEntities = (text) => new DOMParser().parseFromString(text, 'text/html').documentElement.textContent;
const encodeEntities = (text) => text
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const CODECS = {
  base64: {
    label: 'Base64',
    encode: toBase64,
    decode: fromBase64,
  },
  url: {
    label: 'URL',
    encode: (t) => encodeURIComponent(t),
    decode: (t) => decodeURIComponent(t),
  },
  html: {
    label: 'HTML entities',
    encode: encodeEntities,
    decode: decodeEntities,
  },
};

export default {
  id: 'encoder',
  name: 'Encoder / Decoder',
  group: 'Developer',
  icon: '64',
  desc: 'Base64, URL and HTML entity encoding and decoding, live as you type.',
  render(root) {
    let codec = 'base64';
    let direction = 'encode';

    const input = el('textarea', { class: 'area', rows: 7, placeholder: 'Paste text to encode, or encoded text to decode…', spellcheck: 'false' });
    const output = el('textarea', { class: 'area', rows: 7, readonly: true, spellcheck: 'false' });
    const status = el('p', { class: 'status' });

    const run = () => {
      if (!input.value) {
        output.value = '';
        status.className = 'status';
        status.textContent = '';
        return;
      }
      try {
        const fn = CODECS[codec][direction];
        output.value = fn(input.value);
        status.className = 'status good';
        status.textContent = `${CODECS[codec].label} ${direction === 'encode' ? 'encoded' : 'decoded'}`;
      } catch {
        output.value = '';
        status.className = 'status bad';
        status.textContent = direction === 'decode'
          ? `That isn't valid ${CODECS[codec].label} input.`
          : 'Could not encode this text.';
      }
    };

    input.addEventListener('input', run);

    root.append(
      input,
      el('div', { class: 'toolbar' },
        seg(Object.entries(CODECS).map(([key, c]) => [key, c.label]), codec, (v) => { codec = v; run(); }),
        seg([['encode', 'Encode'], ['decode', 'Decode']], direction, (v) => { direction = v; run(); })),
      status,
      output,
      el('div', { class: 'toolbar' },
        el('button', { class: 'btn primary', onclick: () => copy(output.value, 'Result copied') }, 'Copy result')),
    );
  },
};
