// Mock JSON generator: every object has `keys` keys, and the document is `depth` levels deep.
// Leaves are random strings, numbers, booleans or null. Output is always valid JSON.

export const MAX_NODES = 20000;

const WORDS = ['name','id','email','status','total','region','code','label','owner','value','created','updated','score','city','active','count','title','source','level','group','note','flag','rate','unit','type','ref'];
const SAMPLE_STRINGS = ['alpha','beta','gamma','delta','ready','pending','north','south','blue','green','sample','test','lorem','ipsum'];

const pick = list => list[Math.floor(Math.random() * list.length)];

// Rough count of objects the document will contain, so huge requests are refused early
export function countNodes(keys, depth) {
  let total = 0;
  for (let level = 0; level <= depth; level++) total += keys ** level;
  return total;
}

function leaf() {
  const kind = Math.floor(Math.random() * 4);
  if (kind === 0) return pick(SAMPLE_STRINGS);
  if (kind === 1) return Math.floor(Math.random() * 10000) / 100;
  if (kind === 2) return Math.random() < 0.5;
  return null;
}

function object(keys, depth) {
  const out = {};
  const used = new Set();
  for (let i = 0; out && Object.keys(out).length < keys; i++) {
    let name = pick(WORDS);
    if (used.has(name)) name = `${name}_${i}`;
    used.add(name);
    out[name] = depth > 1 ? object(keys, depth - 1) : leaf();
  }
  return out;
}

export function generateMockJson({ keys, depth }) {
  const k = Number(keys), d = Number(depth);
  if (!Number.isInteger(k) || k < 1 || k > 20) throw new Error('Keys per object must be a whole number from 1 to 20.');
  if (!Number.isInteger(d) || d < 1 || d > 10) throw new Error('Nesting depth must be a whole number from 1 to 10.');
  const nodes = countNodes(k, d);
  if (nodes > MAX_NODES) throw new Error(`That is about ${nodes.toLocaleString()} objects. Keep it under ${MAX_NODES.toLocaleString()} by lowering keys or depth.`);
  return object(k, d);
}
