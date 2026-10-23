import { el, resultRow, stat } from '../lib/ui.js';

// JWT segments use base64url: "-" and "_" instead of "+" and "/", with no padding.
function decodeSegment(segment) {
  let b64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  b64 += '='.repeat((4 - (b64.length % 4)) % 4);
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

const when = (seconds) => new Date(seconds * 1000).toLocaleString();

export default {
  id: 'jwt-decoder',
  name: 'JWT Decoder',
  group: 'Developer',
  icon: 'JW',
  desc: 'Decode a JSON Web Token and check its expiry. Runs locally; nothing is sent.',
  render(root) {
    const input = el('textarea', { class: 'area', rows: 4, placeholder: 'eyJhbGciOi…', spellcheck: 'false' });
    const error = el('p', { class: 'status bad' });
    const result = el('div', { class: 'tool' });

    const update = () => {
      error.textContent = '';
      result.replaceChildren();
      const token = input.value.trim();
      if (!token) {
        result.append(el('p', { class: 'status', text: 'Paste a token above to see its header, payload and expiry.' }));
        return;
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        error.textContent = 'A JWT has three parts separated by dots.';
        return;
      }

      let header;
      let payload;
      try {
        header = JSON.parse(decodeSegment(parts[0]));
        payload = JSON.parse(decodeSegment(parts[1]));
      } catch {
        error.textContent = 'The header or payload is not valid Base64url JSON.';
        return;
      }

      const now = Date.now() / 1000;
      const expired = typeof payload.exp === 'number' && payload.exp < now;
      const expiry = typeof payload.exp !== 'number'
        ? 'No expiry'
        : expired ? `Expired ${when(payload.exp)}` : `Valid until ${when(payload.exp)}`;

      result.append(
        el('div', { class: 'stats' },
          stat('Algorithm', header.alg || 'none'),
          stat('Type', header.typ || '—'),
          stat('Status', expiry)),
        el('div', { class: 'grid-2' },
          el('div', { class: 'card' }, el('h2', { text: 'Header' }), el('pre', { class: 'value', text: JSON.stringify(header, null, 2) })),
          el('div', { class: 'card' }, el('h2', { text: 'Payload' }), el('pre', { class: 'value', text: JSON.stringify(payload, null, 2) }))),
        resultRow('Issued at', typeof payload.iat === 'number' ? when(payload.iat) : '—'),
        resultRow('Signature (not verified)', parts[2] || '(empty)'),
        el('p', { class: 'status', text: 'The signature is shown but not checked, because verifying it needs the secret key.' }),
      );
    };

    input.addEventListener('input', update);
    root.append(input, error, result);
    update();
  },
};
