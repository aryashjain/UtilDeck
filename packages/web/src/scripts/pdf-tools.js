// Helpers for the PDF tools: page-range parsing, page sizes, and a shared limit.
export const MAX_PDF_PAGES_PER_DOWNLOAD = 60; // PDF to image renders at most this many pages per run

// "1-3, 5, 8-" -> [1, 2, 3, 5, 8, ...] (1-based, unique, sorted). "-" and "end" mean the last page.
export function parsePageRanges(text, pageCount) {
  const total = Number(pageCount);
  if (!Number.isInteger(total) || total < 1) throw new Error('The PDF has no pages.');
  const cleaned = String(text).trim().toLowerCase().replace(/\bend\b/g, String(total));
  if (cleaned === '') throw new Error('Enter the pages to use, for example 1-3, 5.');
  const pages = new Set();
  for (const raw of cleaned.split(',')) {
    const part = raw.trim();
    if (!part) continue;
    const m = /^(\d*)\s*-\s*(\d*)$/.exec(part) || /^(\d+)$/.exec(part) && [part, part, part];
    if (!m) throw new Error(`"${part}" is not a page or page range.`);
    const lo = m[1] === '' ? 1 : Number(m[1]);
    const hi = m[2] === '' ? total : Number(m[2]);
    if (lo < 1 || hi > total || lo > hi) throw new Error(`Pages must be between 1 and ${total}. Check "${part}".`);
    for (let p = lo; p <= hi; p++) pages.add(p);
  }
  if (pages.size === 0) throw new Error('No pages selected.');
  return [...pages].sort((a, b) => a - b);
}

// Page sizes in PDF points (72 per inch)
export const PAGE_PRESETS = {
  a4: { label: 'A4', width: 595.28, height: 841.89 },
  letter: { label: 'US Letter', width: 612, height: 792 },
  fit: { label: 'Fit to image', width: null, height: null },
};

// Size of a page for an image of w x h pixels, with the image fitted inside the preset page with a margin
export function imagePage(preset, w, h, margin = 0) {
  const p = PAGE_PRESETS[preset];
  if (!p) throw new Error('Choose A4, US Letter or fit to image.');
  if (!(w > 0 && h > 0)) throw new Error('The image has no size.');
  if (p.width === null) return { pageWidth: w, pageHeight: h, drawWidth: w, drawHeight: h, x: 0, y: 0 };
  const availW = p.width - 2 * margin, availH = p.height - 2 * margin;
  const scale = Math.min(availW / w, availH / h);
  const dw = w * scale, dh = h * scale;
  return { pageWidth: p.width, pageHeight: p.height, drawWidth: dw, drawHeight: dh, x: (p.width - dw) / 2, y: (p.height - dh) / 2 };
}

// Moves the item at `from` to `to` in a copy of the list
export function moveItem(list, from, to) {
  if (from < 0 || from >= list.length || to < 0 || to >= list.length) return list;
  const copy = [...list];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}
