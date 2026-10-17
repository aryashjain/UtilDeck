# UtilDeck

UtilDeck: your everyday toolkit. A collection of text and image tools built with Cloudflare Workers and static pages.

## Project Structure

```
toolkit/
├── packages/
│   ├── web/                    # Frontend (static + dynamic pages)
│   │   ├── src/
│   │   │   ├── index.html      # Landing page: searchable list of all tools
│   │   │   ├── styles/         # CSS with light/dark mode
│   │   │   ├── scripts/        # tools.js (registry), nav.js, home.js, utils.js
│   │   │   └── pages/          # Individual tool pages, incl. notepad.html
│   │   └── package.json
│   │
│   └── worker/                 # Cloudflare Worker backend
│       ├── src/
│       │   └── index.js        # Worker handler (API endpoints)
│       ├── wrangler.toml       # Cloudflare config
│       └── package.json
│
└── README.md
```

## Features

### Landing Page
- Lists every tool, grouped by category
- Search box pinned in the nav bar on every page (press `/` to jump to it)
- On tool pages, search shows a dropdown of matches; use arrow keys and Enter

### Notepad (Main Tool)
- 📝 Auto-saving to browser localStorage
- 🔗 Share links that expire after 3 hours (stored in Cloudflare KV)
- 🔐 Optional password protection
- 📊 Real-time stats (words, characters, reading time)
- 📥 Export to .txt and .md
- 🌓 Dark/light mode

### Text Tools (Separate Pages for SEO)
- **Word Counter** - Words, characters, sentences, paragraphs, reading time
- **Case Converter** - UPPER, lower, Title, Sentence case
- **Space Remover** - Remove extra spaces and line breaks
- **Line Tools** - Sort and deduplicate lines
- **Text Diff** - Compare two texts
- **Generators** - Lorem ipsum, slug generator
- **Find & Replace** - Plain text or regular expressions, with match count
- **Text Extractor** - Pull out emails, URLs, numbers and hashtags
- **Encoder / Decoder** - Base64, URL and HTML entities
- **JSON Formatter** - Format, minify and validate JSON
- **Password Generator** - Random passwords from `crypto.getRandomValues`
- **Image Compressor** - Resize and re-encode JPEG, WebP or PNG with a quality slider
- **Image Cropper** - Drag to crop, with preset aspect ratios

### Adding a Tool
1. Create the page in `packages/web/src/pages/` (copy an existing tool page for the layout).
2. Add an entry to `TOOLS` in `packages/web/src/scripts/tools.js`. The landing page, search and nav pick it up automatically.
3. Add the page to the list in any browser test you keep for it.

## Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- Wrangler CLI for Cloudflare Workers: `npm install -g wrangler`

### Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the web server:**
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:8000`

3. **Start the worker (in another terminal):**
   ```bash
   npm run dev -w packages/worker
   ```

### Building

```bash
npm run build
```

### Deploying

One Cloudflare Worker serves the site and the notes API, so there's no separate Pages project.

1. **Log in and create the notes storage** (once):
   ```bash
   npx wrangler login
   npx wrangler kv namespace create NOTES
   npx wrangler kv namespace create NOTES --preview
   ```
   Paste the two returned ids into `packages/worker/wrangler.toml`, replacing the `REPLACE_WITH_...` values.

2. **Deploy:**
   ```bash
   npm run deploy
   ```
   The site is then live at `https://utildeck.<your-subdomain>.workers.dev`. To use your own domain, add it under Workers & Pages → utildeck → Settings → Domains & Routes.

For local development, run `npm run dev -w packages/worker` and open `http://localhost:8787`. The site and notes both work there.

## Tech Stack

- **Frontend:** Vanilla JavaScript, CSS3 (light/dark mode); image tools use the Canvas API
- **Backend:** Cloudflare Workers
- **Storage:** Cloudflare KV (for shared notes)
- **Hosting:** one Cloudflare Worker that serves the static site and the API

## API Endpoints

### Create Note
```
POST /api/notes
Content-Type: application/json

{
  "content": "text content",
  "password": "optional-password"
}

Response: { "id": "abc123", "expiresAt": 1700000000000 }
```
Notes are limited to 200,000 characters and expire 3 hours after creation (`expiresAt` is a Unix time in milliseconds).

### Get Note
```
GET /api/notes/:id?password=optional-password

Response: { "id": "...", "content": "...", "createdAt": ..., "expiresAt": ... }

Errors: 401 when a password is needed (`passwordRequired: true`), 403 for a wrong password, 404 when the note is missing or expired.
```

### Delete Note
```
DELETE /api/notes/:id
```

## Configuration

### Environment Variables
Create `.env.local` in `packages/worker/`:
```
ACCOUNT_ID=your_account_id
```

### Customization
- **Colors:** Edit CSS variables in `packages/web/src/styles/main.css`
- **API URL:** Update fetch URLs in `packages/web/src/scripts/main.js`

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- localStorage for note persistence
- Crypto API for password hashing

## Notes
- Shared notes are deleted 3 hours after they're created
- Dark mode preference is saved to localStorage
- All text processing happens client-side (except sharing)
- No user accounts or logins required

## License
MIT
# UtilDeck
