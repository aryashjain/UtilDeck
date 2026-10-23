# UtilDeck for Chrome

Fourteen everyday text and developer tools in one tab. Everything runs in your browser: nothing you type is sent anywhere, and the extension works offline.

## Tools

**Text**: Word Counter, Case Converter, Find & Replace (with regex), Line Tools (sort, dedupe, trim, undo), Text Diff

**Developer**: JSON Formatter, Encoder / Decoder (Base64, URL, HTML entities), JWT Decoder, Hash Generator (SHA-1 to SHA-512, text or file), UUID & Timestamp, Color Converter

**Everyday**: Password Generator, QR Code (download as PNG), Pomodoro Timer

## Run it locally

1. Open `chrome://extensions` and turn on **Developer mode**.
2. Click **Load unpacked** and choose this `chrome-extension` folder.
3. Click the UtilDeck icon in the toolbar. It opens the tools in a full tab.

Press `/` to search, or pick a tool from the sidebar. The theme button cycles Auto, Light and Dark.

## Layout

```
chrome-extension/
├── manifest.json          Manifest V3, no permissions requested
├── background.js          Opens app.html when the toolbar icon is clicked
├── app.html               The page with the sidebar and tool panel
├── css/app.css            Light and dark themes
├── js/app.js              Routing, search, theme
├── js/lib/ui.js           Shared DOM helpers (buttons, copy, results)
├── js/tools/*.js          One file per tool, plus index.js to register them
├── lib/qrcode.min.js      QR library (MIT, see lib/qrcode-LICENSE.txt)
└── icons/                 16, 48 and 128 px icons
```

To add a tool, create `js/tools/<name>.js` that exports `{ id, name, group, icon, desc, render(root) }`, then import it in `js/tools/index.js`. `render` can return a cleanup function for timers and listeners.

## Testing

The tools were checked in headless Chrome: each one renders, the main interactions produce the expected output (for example, SHA-256 of `abc`), and the page logs no errors. The browser test harness is not part of this folder.

## Publishing to the Chrome Web Store

1. Zip the contents of this folder (the `manifest.json` must be at the root of the zip):
   ```bash
   cd chrome-extension && zip -r ../utildeck.zip . -x "*.DS_Store" "README.md"
   ```
2. Register at the [Chrome Web Store developer dashboard](https://chrome.google.com/webstore/devconsole). There is a one-time $5 fee.
3. Upload the zip. The store listing needs a 128 px icon (included), at least one 1280×800 screenshot, and a description.
4. Set the privacy policy URL to the hosted `PRIVACY.md`, or paste its text.
5. Submit for review. The store asks you to declare that the extension collects no user data, which matches this one.
