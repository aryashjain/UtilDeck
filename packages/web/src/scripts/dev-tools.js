// SQL formatting, XML validation and formatting, cURL conversion, HTTP status codes, and API request building.

// ---- SQL formatter ----
const MAJOR = ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'OFFSET', 'UNION ALL', 'UNION', 'VALUES', 'SET', 'INSERT INTO', 'UPDATE', 'DELETE FROM', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'FULL JOIN', 'CROSS JOIN', 'JOIN', 'ON', 'AND', 'OR'];
const KEYWORDS = new Set(['SELECT','FROM','WHERE','GROUP','BY','HAVING','ORDER','LIMIT','OFFSET','UNION','ALL','VALUES','SET','INSERT','INTO','UPDATE','DELETE','LEFT','RIGHT','INNER','FULL','CROSS','JOIN','ON','AND','OR','NOT','NULL','IS','IN','AS','CASE','WHEN','THEN','ELSE','END','DISTINCT','BETWEEN','LIKE','EXISTS','CREATE','TABLE','DROP','ALTER','INDEX','PRIMARY','KEY','REFERENCES','DEFAULT','ASC','DESC','COUNT','SUM','AVG','MIN','MAX','WITH','TRUE','FALSE']);

// Splits SQL into tokens, keeping strings and comments whole
function tokenize(sql) {
  const tokens = [];
  let i = 0;
  while (i < sql.length) {
    const c = sql[i];
    if (/\s/.test(c)) { i++; continue; }
    if (c === '-' && sql[i + 1] === '-') { const end = sql.indexOf('\n', i); const j = end < 0 ? sql.length : end; tokens.push({ t: 'comment', v: sql.slice(i, j) }); i = j; continue; }
    if (c === "'" || c === '"' || c === '`') {
      let j = i + 1;
      while (j < sql.length && sql[j] !== c) j++;
      if (j >= sql.length) throw new Error('A quote is not closed. Check for a missing ' + c + '.');
      tokens.push({ t: c === "'" ? 'string' : 'ident', v: sql.slice(i, j + 1) }); i = j + 1; continue;
    }
    if (/[(),;]/.test(c)) { tokens.push({ t: c, v: c }); i++; continue; }
    const m = /^[A-Za-z_][A-Za-z0-9_.]*|^\d+(\.\d+)?|^[<>=!]+|^[*+\-/%]/.exec(sql.slice(i));
    if (m) { tokens.push({ t: 'word', v: m[0] }); i += m[0].length; continue; }
    tokens.push({ t: 'other', v: c }); i++;
  }
  return tokens;
}

export function formatSql(sql, indent = '  ') {
  const tokens = tokenize(String(sql));
  if (tokens.length === 0) throw new Error('Paste some SQL.');
  let out = '', depth = 0, line = '';
  const flush = () => { if (line.trim()) out += indent.repeat(depth) + line.trim() + '\n'; line = ''; };
  for (let k = 0; k < tokens.length; k++) {
    const tk = tokens[k];
    const up = tk.t === 'word' ? tk.v.toUpperCase() : '';
    // Multi-word clauses such as GROUP BY and LEFT JOIN
    const pair = tk.t === 'word' && tokens[k + 1] && tokens[k + 1].t === 'word' ? up + ' ' + tokens[k + 1].v.toUpperCase() : '';
    const isMajor = MAJOR.includes(pair) || MAJOR.includes(up);
    if (tk.t === 'comment') { flush(); out += indent.repeat(depth) + tk.v + '\n'; continue; }
    if (tk.t === ';') { line += ';'; flush(); depth = 0; out += '\n'; continue; }
    if (tk.t === '(') { line += ' ('; depth++; flush(); continue; }
    if (tk.t === ')') { flush(); depth = Math.max(0, depth - 1); line = ')'; continue; }
    if (tk.t === ',') { line += ','; flush(); continue; }
    if (isMajor && !(up === 'ON' || up === 'AND' || up === 'OR') && line.trim()) { flush(); }
    if (isMajor && pair && MAJOR.includes(pair)) { line += (line ? ' ' : '') + pair; k++; flush(); continue; }
    if (isMajor) { line += (line ? ' ' : '') + up; if (up === 'AND' || up === 'OR' || up === 'ON') { flush(); depth = depth; } continue; }
    const v = tk.t === 'word' && KEYWORDS.has(up) ? up : tk.v;
    line += (line && !line.endsWith('(') ? ' ' : '') + v;
  }
  flush();
  return out.replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
}

// ---- XML ----
export function checkXml(text) {
  if (!text.trim()) throw new Error('Paste some XML.');
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  const err = doc.getElementsByTagName('parsererror')[0];
  if (err) {
    const msg = err.textContent.trim().split('\n')[0];
    throw new Error('Not valid XML: ' + msg);
  }
  return doc;
}

export function formatXml(text, indent = '  ') {
  // Validation needs DOMParser (browsers have it; the check is done on the page)
  if (typeof DOMParser !== 'undefined') checkXml(text);
  const tokens = String(text).replace(/>\s+</g, '><').trim().split(/(?=<)|(?<=>)/g).filter(Boolean);
  let depth = 0, out = '';
  for (let k = 0; k < tokens.length; k++) {
    const t = tokens[k];
    // <tag>text</tag> stays on one line
    if (/^<[^/!?>][^>]*>$/.test(t) && !/\/>$/.test(t) && tokens[k + 1] && !/^</.test(tokens[k + 1]) && tokens[k + 2] && /^<\//.test(tokens[k + 2])) {
      out += indent.repeat(depth) + t + tokens[k + 1].trim() + tokens[k + 2] + '\n';
      k += 2; continue;
    }
    if (/^<\//.test(t)) { depth = Math.max(0, depth - 1); out += indent.repeat(depth) + t + '\n'; }
    else if (/^<\?|^<!/.test(t)) { out += indent.repeat(depth) + t + '\n'; }
    else if (/^</.test(t) && !/\/>$/.test(t)) { out += indent.repeat(depth) + t + '\n'; depth++; }
    else if (/^</.test(t)) { out += indent.repeat(depth) + t + '\n'; }
    else { out += indent.repeat(depth) + t.trim() + '\n'; }
  }
  return out;
}

// ---- cURL to code ----
// Splits a shell command into words, honouring single quotes, double quotes, backslash line continuations
export function shellWords(command) {
  const s = String(command).replace(/\\\r?\n/g, ' ');
  const words = [];
  let cur = '', has = false, i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) { if (has) { words.push(cur); cur = ''; has = false; } i++; continue; }
    if (c === "'") { const j = s.indexOf("'", i + 1); if (j < 0) throw new Error('A single quote is not closed.'); cur += s.slice(i + 1, j); has = true; i = j + 1; continue; }
    if (c === '"') { let j = i + 1; while (j < s.length && s[j] !== '"') { if (s[j] === '\\' && j + 1 < s.length) { cur += s[j + 1]; j += 2; continue; } cur += s[j]; j++; } if (j >= s.length) throw new Error('A double quote is not closed.'); has = true; i = j + 1; continue; }
    if (c === '\\' && i + 1 < s.length) { cur += s[i + 1]; has = true; i += 2; continue; }
    cur += c; has = true; i++;
  }
  if (has) words.push(cur);
  return words;
}

export function parseCurl(command) {
  const w = shellWords(command.trim());
  if (w[0] !== 'curl') throw new Error('The command should start with curl.');
  const req = { method: null, url: '', headers: {}, data: null, user: null };
  for (let i = 1; i < w.length; i++) {
    const a = w[i];
    const next = () => { if (i + 1 >= w.length) throw new Error(`${a} needs a value.`); return w[++i]; };
    if (a === '-X' || a === '--request') req.method = next().toUpperCase();
    else if (a === '-H' || a === '--header') { const h = next(); const idx = h.indexOf(':'); if (idx > 0) req.headers[h.slice(0, idx).trim()] = h.slice(idx + 1).trim(); }
    else if (['-d', '--data', '--data-raw', '--data-binary', '--data-ascii'].includes(a)) req.data = (req.data ? req.data + '&' : '') + next();
    else if (a === '-u' || a === '--user') req.user = next();
    else if (a === '-G' || a === '--get') req.method = req.method || 'GET';
    else if (a === '-L' || a === '--location' || a === '-s' || a === '--silent' || a === '-k' || a === '--insecure' || a === '-v' || a === '--verbose') { /* ignored */ }
    else if (!a.startsWith('-')) req.url = a;
    else if (/^-(?:[a-zA-Z]+)$/.test(a) && ['o','A','e','m'].includes(a.slice(-1))) next();
  }
  if (!req.url) throw new Error('No URL found in the command.');
  if (!req.method) req.method = req.data !== null ? 'POST' : 'GET';
  if (req.user) req.headers.Authorization = 'Basic ' + btoa(unescape(encodeURIComponent(req.user)));
  return req;
}

export function curlToFetch(req) {
  const opts = { method: req.method };
  if (Object.keys(req.headers).length) opts.headers = req.headers;
  if (req.data !== null) opts.body = req.data;
  return `fetch(${JSON.stringify(req.url)}, ${JSON.stringify(opts, null, 2).replace(/\n/g, '\n')})\n  .then(res => res.text())\n  .then(console.log);\n`;
}

export function curlToPython(req) {
  const lines = ['import requests', '', `response = requests.request(${JSON.stringify(req.method)}, ${JSON.stringify(req.url)}`];
  if (Object.keys(req.headers).length) lines[2] += `,\n    headers=${JSON.stringify(req.headers)}`;
  if (req.data !== null) lines[2] += `,\n    data=${JSON.stringify(req.data)}`;
  lines[2] += ')';
  lines.push('print(response.status_code)', 'print(response.text)', '');
  return lines.join('\n');
}

// ---- HTTP status codes ----
export const HTTP_STATUS = [
  [100,'Continue','The client may continue sending the rest of the request.'],
  [101,'Switching Protocols','The server agrees to switch protocols, such as to WebSocket.'],
  [200,'OK','The request succeeded.'],
  [201,'Created','A new resource was created.'],
  [202,'Accepted','The request was accepted but not finished yet.'],
  [204,'No Content','Success, and there is nothing to send back.'],
  [206,'Partial Content','The server sent part of the resource, as requested by a range.'],
  [301,'Moved Permanently','The resource has a new permanent address. Search engines transfer the ranking.'],
  [302,'Found','The resource is temporarily at another address.'],
  [304,'Not Modified','The cached copy is still valid, so no body is sent.'],
  [307,'Temporary Redirect','Temporary redirect that keeps the same method.'],
  [308,'Permanent Redirect','Permanent redirect that keeps the same method.'],
  [400,'Bad Request','The request is malformed or invalid.'],
  [401,'Unauthorized','Authentication is required or has failed.'],
  [403,'Forbidden','The server understood the request but refuses it.'],
  [404,'Not Found','The resource does not exist at this address.'],
  [405,'Method Not Allowed','The method is not allowed for this resource.'],
  [408,'Request Timeout','The server timed out waiting for the request.'],
  [409,'Conflict','The request conflicts with the current state of the resource.'],
  [410,'Gone','The resource was removed and will not come back.'],
  [413,'Payload Too Large','The request body is larger than the server accepts.'],
  [415,'Unsupported Media Type','The content type is not supported.'],
  [422,'Unprocessable Content','The request is well formed but has semantic errors.'],
  [429,'Too Many Requests','Rate limit reached. Wait and try again.'],
  [500,'Internal Server Error','The server hit an unexpected error.'],
  [501,'Not Implemented','The server does not support this feature.'],
  [502,'Bad Gateway','A gateway or proxy received an invalid response.'],
  [503,'Service Unavailable','The server is overloaded or down for maintenance.'],
  [504,'Gateway Timeout','A gateway or proxy timed out waiting for the server.'],
];

export function findStatus(query) {
  const q = String(query).trim().toLowerCase();
  if (!q) return HTTP_STATUS;
  return HTTP_STATUS.filter(([code, name, desc]) => String(code).startsWith(q) || name.toLowerCase().includes(q) || desc.toLowerCase().includes(q));
}

// ---- API request building (used by the API tester) ----
export function buildRequest({ method = 'GET', url, headers = '', body = '' }) {
  let u;
  try { u = new URL(String(url).trim()); } catch { throw new Error('Enter a full URL with https:// or http://.'); }
  if (!/^https?:$/.test(u.protocol)) throw new Error('Only http and https addresses can be tested.');
  const h = {};
  for (const line of String(headers).split('\n')) {
    const idx = line.indexOf(':');
    if (idx > 0) h[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  const m = String(method).toUpperCase();
  const init = { method: m, headers: h };
  if (!['GET', 'HEAD'].includes(m) && body) init.body = body;
  if ((m === 'GET' || m === 'HEAD') && body) throw new Error('GET and HEAD requests cannot have a body.');
  return { url: u.toString(), init };
}
