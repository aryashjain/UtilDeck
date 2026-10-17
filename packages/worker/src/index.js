// Shared notes API. Notes expire NOTE_TTL_SECONDS after they are created.
const NOTE_TTL_SECONDS = 3 * 60 * 60; // 3 hours
const MAX_CONTENT_LENGTH = 200000; // characters
const NOTE_ID_PATTERN = /^\/api\/notes\/[a-z0-9]+$/;
const REQUEST_DETAILS_LENGTH = 1000; // characters
// Tool requests are stored in the NOTES namespace under this prefix. Note ids never contain ':', so they can't collide.
const REQUEST_PREFIX = 'request:';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // The site and the API share one origin, so CORS is only needed for other origins.
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (path === '/api/notes' && request.method === 'POST') {
      return handleCreateNote(request, env, corsHeaders);
    }

    if (path === '/api/requests' && request.method === 'POST') {
      return handleCreateRequest(request, env, corsHeaders);
    }

    if (NOTE_ID_PATTERN.test(path) && request.method === 'GET') {
      return handleGetNote(request, env, corsHeaders);
    }

    if (NOTE_ID_PATTERN.test(path) && request.method === 'DELETE') {
      return handleDeleteNote(request, env, corsHeaders);
    }

    // Unknown API routes get a JSON 404. Everything else is the static site.
    if (path.startsWith('/api/')) {
      return json({ error: 'Not found' }, 404, corsHeaders);
    }
    return env.ASSETS.fetch(request);
  },
};

function json(body, status, corsHeaders) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleCreateNote(request, env, corsHeaders) {
  let content;
  let password;
  try {
    ({ content, password } = await request.json());
  } catch {
    return json({ error: 'Request body must be JSON' }, 400, corsHeaders);
  }

  if (!content) {
    return json({ error: 'Content is required' }, 400, corsHeaders);
  }
  if (content.length > MAX_CONTENT_LENGTH) {
    return json({ error: `Note is too long (max ${MAX_CONTENT_LENGTH.toLocaleString()} characters)` }, 413, corsHeaders);
  }

  const id = generateId();
  const createdAt = Date.now();
  const expiresAt = createdAt + NOTE_TTL_SECONDS * 1000;

  const note = {
    id,
    content,
    password: password ? await hashPassword(password) : null,
    createdAt,
    expiresAt,
  };

  await env.NOTES.put(id, JSON.stringify(note), { expirationTtl: NOTE_TTL_SECONDS });

  return json({ id, expiresAt }, 200, corsHeaders);
}

// Stores a "request a tool" submission. Requests are kept (no expiry) so they can be reviewed later
// with: npx wrangler kv key list --binding NOTES --prefix request:
async function handleCreateRequest(request, env, corsHeaders) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Request body must be JSON' }, 400, corsHeaders);
  }

  const tool = String(body.tool ?? '').trim();
  const details = String(body.details ?? '').trim();
  const email = String(body.email ?? '').trim();

  if (tool.length < 2 || tool.length > 100) {
    return json({ error: 'Please give the tool name (2 to 100 characters).' }, 400, corsHeaders);
  }
  if (details.length > REQUEST_DETAILS_LENGTH) {
    return json({ error: 'The description is too long (max 1,000 characters).' }, 413, corsHeaders);
  }
  if (email && (email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    return json({ error: 'That email address does not look right.' }, 400, corsHeaders);
  }

  const createdAt = Date.now();
  const key = `${REQUEST_PREFIX}${createdAt}:${generateId()}`;
  await env.NOTES.put(key, JSON.stringify({ tool, details, email: email || null, createdAt }));

  return json({ ok: true }, 200, corsHeaders);
}

async function handleGetNote(request, env, corsHeaders) {
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();
  const stored = await env.NOTES.get(id);

  if (!stored) {
    return json({ error: 'Note not found or expired' }, 404, corsHeaders);
  }

  const note = JSON.parse(stored);

  // KV can keep an entry a little past its TTL, so check the expiry ourselves too
  if (note.expiresAt <= Date.now()) {
    await env.NOTES.delete(id);
    return json({ error: 'Note not found or expired' }, 404, corsHeaders);
  }

  if (note.password) {
    const password = url.searchParams.get('password');
    if (!password) {
      return json({ error: 'Password required', passwordRequired: true }, 401, corsHeaders);
    }
    if (await hashPassword(password) !== note.password) {
      return json({ error: 'Incorrect password', passwordRequired: true }, 403, corsHeaders);
    }
  }

  return json({
    id: note.id,
    content: note.content,
    createdAt: note.createdAt,
    expiresAt: note.expiresAt,
  }, 200, corsHeaders);
}

async function handleDeleteNote(request, env, corsHeaders) {
  const id = new URL(request.url).pathname.split('/').pop();
  await env.NOTES.delete(id);
  return json({ success: true }, 200, corsHeaders);
}

function generateId() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 16);
}

// SHA-256 is fast, so a salted PBKDF2 would be stronger for real secrets.
// Notes here are short-lived and opt-in, so this is fine for now.
async function hashPassword(password) {
  const data = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer), b => b.toString(16).padStart(2, '0')).join('');
}
