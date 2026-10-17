// Where the notes API lives. The Worker serves both the site and /api, so this path works
// in production and under `npm run dev -w packages/worker` (http://localhost:8787).
export const NOTES_API = '/api/notes';

// Shared notes expire this many hours after they are created. Keep in sync with the Worker.
export const NOTE_LIFETIME_HOURS = 3;

export const NOTES_UNAVAILABLE =
  'The notes server did not respond. It is not running at this address. See scripts/config.js.';

// Where "Request a tool" submissions go (same Worker as the notes API)
export const REQUESTS_API = '/api/requests';
