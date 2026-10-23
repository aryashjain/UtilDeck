import { el, resultRow } from '../lib/ui.js';

const ALGORITHMS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

async function hexDigest(algorithm, data) {
  const buffer = await crypto.subtle.digest(algorithm, data);
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export default {
  id: 'hash-generator',
  name: 'Hash Generator',
  group: 'Developer',
  icon: '#',
  desc: 'SHA-1 to SHA-512 hashes for text or any file, computed in your browser.',
  render(root) {
    let run = 0;
    let file = null;

    const input = el('textarea', { class: 'area', rows: 5, placeholder: 'Type or paste text to hash…', spellcheck: 'false' });
    const fileInput = el('input', { class: 'input', type: 'file' });
    const note = el('p', { class: 'status' });
    const results = el('div', { class: 'tool' });

    const update = async () => {
      const id = ++run;
      let data;
      if (file) {
        data = await file.arrayBuffer();
        note.textContent = `${file.name} · ${data.byteLength.toLocaleString()} bytes`;
      } else {
        data = new TextEncoder().encode(input.value);
        note.textContent = `${data.byteLength.toLocaleString()} bytes`;
      }
      const digests = await Promise.all(ALGORITHMS.map((a) => hexDigest(a, data)));
      if (id !== run) return; // a newer input has arrived
      results.replaceChildren(...ALGORITHMS.map((a, i) => resultRow(a, digests[i])));
    };

    input.addEventListener('input', () => {
      file = null;
      fileInput.value = '';
      update();
    });
    fileInput.addEventListener('change', () => {
      file = fileInput.files[0] || null;
      if (file) input.value = '';
      update();
    });

    root.append(input, el('div', { class: 'toolbar' }, fileInput), note, results);
    update();
  },
};
