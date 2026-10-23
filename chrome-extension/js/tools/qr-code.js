import { el, download, seg } from '../lib/ui.js';

// The QR library is loaded only when this tool opens, from the extension's own files.
let loading = null;
function loadQrLibrary() {
  if (window.QRCode) return Promise.resolve();
  loading ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'lib/qrcode.min.js';
    script.onload = resolve;
    script.onerror = () => reject(new Error('QR library failed to load'));
    document.head.append(script);
  });
  return loading;
}

export default {
  id: 'qr-code',
  name: 'QR Code',
  group: 'Everyday',
  icon: 'QR',
  desc: 'Turn a link or text into a QR code you can download as PNG.',
  render(root) {
    let size = 256;
    const input = el('textarea', { class: 'area', rows: 3, placeholder: 'https://example.com or any text', spellcheck: 'false' });
    const canvas = el('canvas');
    const box = el('div', { class: 'qr-box' }, canvas);
    const status = el('p', { class: 'status' });
    const downloadBtn = el('button', { class: 'btn primary', onclick: () => {
      canvas.toBlob((blob) => download('qr-code.png', blob), 'image/png');
    } }, 'Download PNG');

    let ready = false;
    const draw = () => {
      const text = input.value;
      downloadBtn.disabled = !ready || !text;
      if (!ready || !text) {
        box.hidden = !text;
        status.textContent = ready ? '' : 'Loading…';
        return;
      }
      box.hidden = false;
      window.QRCode.toCanvas(canvas, text, { width: size, margin: 2, errorCorrectionLevel: 'M' }, (err) => {
        status.className = err ? 'status bad' : 'status';
        status.textContent = err ? 'That is too much text for one QR code.' : '';
      });
    };

    input.addEventListener('input', draw);
    root.append(
      input,
      el('div', { class: 'toolbar' },
        seg([[128, 'Small'], [256, 'Medium'], [512, 'Large']], size, (v) => { size = v; draw(); }),
        downloadBtn),
      status,
      box,
    );
    box.hidden = true;
    downloadBtn.disabled = true;

    loadQrLibrary()
      .then(() => {
        ready = true;
        draw();
      })
      .catch((err) => {
        status.className = 'status bad';
        status.textContent = err.message;
      });
  },
};
