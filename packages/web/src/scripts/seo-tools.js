// Meta tag preview checks, sitemap and robots.txt generation, GST and EMI calculations.

// ---- Meta tags ----
export function metaChecks({ title = '', description = '', url = '' }) {
  const issues = [];
  const t = title.trim(), d = description.trim();
  if (!t) issues.push('Add a page title.');
  else if (t.length > 60) issues.push(`The title is ${t.length} characters. Search results usually show about 60, so shorten it.`);
  else if (t.length < 30) issues.push(`The title is only ${t.length} characters. A longer, specific title often ranks better.`);
  if (!d) issues.push('Add a meta description.');
  else if (d.length > 160) issues.push(`The description is ${d.length} characters. Search results usually show about 160, so shorten it.`);
  else if (d.length < 70) issues.push(`The description is ${d.length} characters. Aim for 120 to 160.`);
  if (url) {
    try { const u = new URL(url); if (u.protocol !== 'https:') issues.push('Use an https address.'); }
    catch { issues.push('The page address is not a valid URL.'); }
  }
  return { issues, titleLength: t.length, descriptionLength: d.length };
}

export function metaTags({ title, description, url, image }) {
  const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const lines = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}">`,
    `<link rel="canonical" href="${esc(url)}">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    `<meta property="og:url" content="${esc(url)}">`,
  ];
  if (image) lines.push(`<meta property="og:image" content="${esc(image)}">`);
  lines.push(`<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}">`);
  return lines.join('\n');
}

// ---- Sitemap ----
export const MAX_SITEMAP_URLS = 50000;
export function buildSitemap(urls, { lastmod = '', changefreq = '', priority = '' } = {}) {
  const list = [...new Set(urls.map(u => String(u).trim()).filter(Boolean))];
  if (list.length === 0) throw new Error('Add at least one URL.');
  if (list.length > MAX_SITEMAP_URLS) throw new Error(`A sitemap can hold up to ${MAX_SITEMAP_URLS.toLocaleString()} URLs. Split it into several files.`);
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  for (const u of list) {
    let parsed;
    try { parsed = new URL(u); } catch { throw new Error(`"${u}" is not a full URL. Include https://.`); }
    if (!/^https?:$/.test(parsed.protocol)) throw new Error(`"${u}" must start with http:// or https://.`);
  }
  if (lastmod && !/^\d{4}-\d{2}-\d{2}$/.test(lastmod)) throw new Error('Use the date format YYYY-MM-DD for the last-modified date.');
  if (priority && !(Number(priority) >= 0 && Number(priority) <= 1)) throw new Error('Priority must be between 0.0 and 1.0.');
  const body = list.map(u => {
    let s = `  <url>\n    <loc>${esc(u)}</loc>`;
    if (lastmod) s += `\n    <lastmod>${lastmod}</lastmod>`;
    if (changefreq) s += `\n    <changefreq>${changefreq}</changefreq>`;
    if (priority) s += `\n    <priority>${Number(priority).toFixed(1)}</priority>`;
    return s + '\n  </url>';
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

// ---- robots.txt ----
// rules: [{ agent: '*', allow: ['/'], disallow: ['/admin'] }]
export function buildRobots({ rules = [], sitemap = '', crawlDelay = '' }) {
  const blocks = [];
  for (const r of rules) {
    const agent = (r.agent || '*').trim() || '*';
    const lines = [`User-agent: ${agent}`];
    for (const a of r.allow || []) if (a.trim()) lines.push(`Allow: ${a.trim()}`);
    for (const d of r.disallow || []) if (d.trim()) lines.push(`Disallow: ${d.trim()}`);
    if (crawlDelay && Number(crawlDelay) > 0) lines.push(`Crawl-delay: ${Number(crawlDelay)}`);
    blocks.push(lines.join('\n'));
  }
  if (blocks.length === 0) throw new Error('Add at least one rule.');
  let out = blocks.join('\n\n') + '\n';
  if (sitemap) {
    let u;
    try { u = new URL(sitemap.trim()); } catch { throw new Error('The sitemap address must be a full URL.'); }
    out += `\nSitemap: ${u.toString()}\n`;
  }
  return out;
}

// ---- Money ----
export function gst({ amount, rate, mode = 'exclusive', interstate = false }) {
  const a = Number(amount), r = Number(rate);
  if (!(a >= 0)) throw new Error('Enter an amount of zero or more.');
  if (![0, 3, 5, 12, 18, 28].includes(r)) throw new Error('Choose a GST rate: 0, 3, 5, 12, 18 or 28 percent.');
  let base, tax;
  if (mode === 'inclusive') { base = a * 100 / (100 + r); tax = a - base; }
  else { base = a; tax = a * r / 100; }
  const total = base + tax;
  const half = tax / 2;
  return {
    base: round2(base),
    tax: round2(tax),
    total: round2(total),
    cgst: interstate ? 0 : round2(half),
    sgst: interstate ? 0 : round2(half),
    igst: interstate ? round2(tax) : 0,
  };
}

export function emi({ principal, annualRate, months }) {
  const P = Number(principal), n = Number(months), rate = Number(annualRate);
  if (!(P > 0)) throw new Error('Enter a loan amount above zero.');
  if (!(rate >= 0)) throw new Error('Interest cannot be negative.');
  if (!Number.isInteger(n) || n < 1 || n > 600) throw new Error('Tenure must be a whole number of months from 1 to 600.');
  const r = rate / 12 / 100;
  const monthly = r === 0 ? P / n : P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  const total = monthly * n;
  return { monthly: round2(monthly), totalPayment: round2(total), totalInterest: round2(total - P) };
}

const round2 = v => Math.round(v * 100) / 100;
