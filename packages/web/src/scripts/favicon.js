// Favicon files: ICO container (PNG frames), web app manifest and HTML tags.

export const FAVICON_SIZES = [16, 32, 48, 180, 192, 512];
export const ICO_SIZES = [16, 32, 48];

// Builds an .ico file from PNG frames. Each frame is { size, png: Uint8Array }.
// Layout: 6-byte header, one 16-byte directory entry per frame, then the PNG data.
export function buildIco(frames) {
  if (!frames.length) throw new Error('No images to pack.');
  const count = frames.length;
  const headerSize = 6 + 16 * count;
  const total = headerSize + frames.reduce((sum, f) => sum + f.png.length, 0);
  const out = new Uint8Array(total);
  const view = new DataView(out.buffer);
  view.setUint16(0, 0, true);          // reserved
  view.setUint16(2, 1, true);          // type 1 = icon
  view.setUint16(4, count, true);      // number of images
  let offset = headerSize;
  frames.forEach((f, i) => {
    const e = 6 + i * 16;
    out[e] = f.size >= 256 ? 0 : f.size;   // width (0 means 256)
    out[e + 1] = f.size >= 256 ? 0 : f.size; // height
    out[e + 2] = 0;                        // colour count (0 = more than 256)
    out[e + 3] = 0;                        // reserved
    view.setUint16(e + 4, 1, true);        // colour planes
    view.setUint16(e + 6, 32, true);       // bits per pixel
    view.setUint32(e + 8, f.png.length, true);
    view.setUint32(e + 12, offset, true);
    out.set(f.png, offset);
    offset += f.png.length;
  });
  return out;
}

// Web app manifest for installable sites (references the 192 and 512 icons)
export function manifestJson({ name = 'My App', shortName = 'App', themeColor = '#4f46e5', backgroundColor = '#ffffff' } = {}) {
  return JSON.stringify({
    name,
    short_name: shortName,
    icons: [
      { src: 'favicon-192.png', sizes: '192x192', type: 'image/png' },
      { src: 'favicon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    theme_color: themeColor,
    background_color: backgroundColor,
    display: 'standalone',
  }, null, 2);
}

// Tags to paste into <head>. `base` is the folder the files are served from, e.g. '/'.
export function headTags(base = '/') {
  const b = base.endsWith('/') ? base : base + '/';
  return [
    `<link rel="icon" href="${b}favicon.ico" sizes="any">`,
    `<link rel="icon" type="image/png" sizes="32x32" href="${b}favicon-32.png">`,
    `<link rel="icon" type="image/png" sizes="16x16" href="${b}favicon-16.png">`,
    `<link rel="apple-touch-icon" sizes="180x180" href="${b}apple-touch-icon.png">`,
    `<link rel="manifest" href="${b}manifest.json">`,
  ].join('\n');
}
