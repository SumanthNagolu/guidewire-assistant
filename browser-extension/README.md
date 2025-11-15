# InTime Web Activity Monitor

Browser extension that captures web usage metrics (active time, scroll behavior, social media detection) and streams them to the productivity dashboard.

## Features

- Tracks active time per page (ignores hidden tabs)
- Measures scroll engagement (duration, count, depth)
- Classifies domains (social vs productive vs neutral)
- Buffers events and periodically posts them to `http://localhost:3000/api/productivity/web-activity`
- Persists unsent events in `chrome.storage.local`

## Local Testing

1. Build the extension directory:
   - No build step is required; files under `browser-extension/` can be loaded directly
2. Open Chrome/Edge → Extensions → Enable **Developer mode**
3. Click **Load unpacked** and select the `browser-extension` folder
4. Browse a few pages; check the background page console for logs

## Integration Notes

- The desktop agent/API must expose `POST /api/productivity/web-activity` accepting `{ events: Event[] }`
- Authorization header currently uses `Bearer extension-key`; configure the server accordingly
- Extend `SOCIAL_DOMAINS` / `WORK_DOMAINS` in `background.js` to tune categorisation

## Roadmap

- Native messaging bridge to desktop agent
- Edge/Firefox compatibility tweaks
- Configurable sampling interval & domain lists via options page


