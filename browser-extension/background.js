const SOCIAL_DOMAINS = [
  'facebook.com',
  'instagram.com',
  'linkedin.com',
  'twitter.com',
  'x.com',
  'youtube.com',
  'tiktok.com',
  'reddit.com',
  'pinterest.com',
  'snapchat.com',
  'threads.net',
];

const WORK_DOMAINS = [
  'intimesolutions.com',
  'guidewire.com',
  'salesforce.com',
  'microsoft.com',
  'sharepoint.com',
];

const FLUSH_INTERVAL_MS = 60000;
const MAX_BUFFERED_EVENTS = 500;

let pendingEvents = [];
let flushing = false;

const getDomainCategory = (hostname) => {
  const host = (hostname || '').toLowerCase();
  if (!host) return 'unknown';

  const matchesDomain = (domain) => host === domain || host.endsWith(`.${domain}`);

  if (SOCIAL_DOMAINS.some(matchesDomain)) {
    return 'social';
  }

  if (WORK_DOMAINS.some(matchesDomain)) {
    return 'productive';
  }

  return 'neutral';
};

const persistBuffer = () => {
  chrome.storage.local.set({ pendingEvents });
};

const loadBuffer = () => {
  chrome.storage.local.get(['pendingEvents'], (result) => {
    if (Array.isArray(result.pendingEvents)) {
      pendingEvents = result.pendingEvents;
    }
  });
};

const bufferEvent = (event) => {
  pendingEvents.push(event);
  if (pendingEvents.length > MAX_BUFFERED_EVENTS) {
    pendingEvents = pendingEvents.slice(-MAX_BUFFERED_EVENTS);
  }
  persistBuffer();
};

const flushToServer = async () => {
  if (flushing || pendingEvents.length === 0) {
    return;
  }

  flushing = true;
  const eventsToSend = [...pendingEvents];

  try {
    await fetch('http://localhost:3000/api/productivity/web-activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer extension-key',
      },
      body: JSON.stringify({ events: eventsToSend, sentAt: new Date().toISOString() }),
    });

    pendingEvents = [];
    persistBuffer();
  } catch (error) {
    console.warn('InTime extension failed to flush web activity', error);
  } finally {
    flushing = false;
  }
};

chrome.runtime.onInstalled.addListener(loadBuffer);
loadBuffer();

chrome.runtime.onMessage.addListener((message, sender, _sendResponse) => {
  if (message?.type !== 'web-activity' || !message.payload) {
    return;
  }

  const enriched = {
    ...message.payload,
    receivedAt: new Date().toISOString(),
    tabId: sender?.tab?.id || null,
    windowId: sender?.tab?.windowId || null,
  };

  enriched.category = getDomainCategory(enriched.hostname);
  enriched.isSocial = enriched.category === 'social';

  bufferEvent(enriched);
});

setInterval(flushToServer, FLUSH_INTERVAL_MS);


