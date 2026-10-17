// Where the notes API lives. In production the Worker sits on the same domain under /api.
// For local development against `wrangler dev`, use http://localhost:8787/api/notes instead.
export const NOTES_API = '/api/notes';

// Shared notes expire this many hours after they are created. Keep in sync with the Worker.
export const NOTE_LIFETIME_HOURS = 3;

export const NOTES_UNAVAILABLE =
  'The notes server did not respond. It is not running at this address. See scripts/config.js.';
