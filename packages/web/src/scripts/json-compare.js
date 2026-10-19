// JSON comparison: which values differ (by path) and which lines of the formatted JSON differ.

const isPlainObject = v => v !== null && typeof v === 'object' && !Array.isArray(v);

// Readable path for a key: $.user.name, $.items[2], $["first name"]
function childPath(path, key) {
  return /^[A-Za-z_$][\w$]*$/.test(key) ? `${path}.${key}` : `${path}[${JSON.stringify(key)}]`;
}

// Walks both values and returns every place they differ.
// Each difference has a path, a kind (added, removed or changed), and the two sub-values.
export function diffJson(left, right, path = '$', out = []) {
  if (isPlainObject(left) && isPlainObject(right)) {
    const keys = [...new Set([...Object.keys(left), ...Object.keys(right)])].sort();
    for (const key of keys) {
      const p = childPath(path, key);
      if (!(key in right)) out.push({ path: p, kind: 'removed', left: left[key], right: undefined });
      else if (!(key in left)) out.push({ path: p, kind: 'added', left: undefined, right: right[key] });
      else diffJson(left[key], right[key], p, out);
    }
    return out;
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    const length = Math.max(left.length, right.length);
    for (let i = 0; i < length; i++) {
      const p = `${path}[${i}]`;
      if (i >= right.length) out.push({ path: p, kind: 'removed', left: left[i], right: undefined });
      else if (i >= left.length) out.push({ path: p, kind: 'added', left: undefined, right: right[i] });
      else diffJson(left[i], right[i], p, out);
    }
    return out;
  }

  // Different types (object vs array vs number, etc.) or different primitive values
  if (JSON.stringify(left) !== JSON.stringify(right)) {
    out.push({ path, kind: 'changed', left, right });
  }
  return out;
}

// Canonical text for line comparison: keys sorted, two-space indent, so key order never causes a false difference
export function canonicalLines(value) {
  const sortKeys = v => {
    if (Array.isArray(v)) return v.map(sortKeys);
    if (isPlainObject(v)) return Object.fromEntries(Object.keys(v).sort().map(k => [k, sortKeys(v[k])]));
    return v;
  };
  return JSON.stringify(sortKeys(value), null, 2).split('\n');
}

// Line diff using longest common subsequence. Returns ops: { type: 'same' | 'added' | 'removed', text }
export function lineDiff(a, b) {
  const n = a.length, m = b.length;
  const table = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      table[i][j] = a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }
  const ops = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { ops.push({ type: 'same', text: a[i] }); i++; j++; }
    else if (table[i + 1][j] >= table[i][j + 1]) { ops.push({ type: 'removed', text: a[i] }); i++; }
    else { ops.push({ type: 'added', text: b[j] }); j++; }
  }
  while (i < n) ops.push({ type: 'removed', text: a[i++] });
  while (j < m) ops.push({ type: 'added', text: b[j++] });
  return ops;
}

// Points at the likely cause of an invalid JSON text: a colon with no value after it (the most common slip).
// Returns { line, snippet, hint } or null when nothing obvious is found.
export function locateError(text) {
  const match = /:\s*(?=[,}\]])/.exec(text);
  if (!match) return null;
  const line = text.slice(0, match.index).split('\n').length;
  const snippet = text.split('\n')[line - 1].trim();
  return { line, snippet, hint: 'A value is missing after this colon.' };
}

// Parses both texts. Returns { left, right } values, or { error, side, line, snippet, hint } if either is not valid JSON.
export function parsePair(leftText, rightText) {
  const parse = (text, side) => {
    try {
      return { value: JSON.parse(text) };
    } catch (err) {
      return { error: err.message, side, ...(locateError(text) || {}) };
    }
  };
  const l = parse(leftText, 'left');
  if (l.error) return l;
  const r = parse(rightText, 'right');
  if (r.error) return r;
  return { left: l.value, right: r.value };
}
