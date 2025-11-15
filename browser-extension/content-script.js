(() => {
  const UPDATE_INTERVAL_MS = 30000; // 30 seconds
  const SCROLL_STOP_DELAY_MS = 1200;

  let sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  let visibleSince = document.hidden ? null : Date.now();
  let accumulatedVisibleMs = 0;

  let isScrolling = false;
  let scrollStart = 0;
  let scrollStopTimer = null;
  let totalScrollMs = 0;
  let scrollEvents = 0;
  let maxScrollDepth = 0;

  const updateVisibility = () => {
    const now = Date.now();
    if (document.hidden) {
      if (visibleSince) {
        accumulatedVisibleMs += now - visibleSince;
        visibleSince = null;
      }
      stopScrolling();
    } else {
      visibleSince = now;
    }
  };

  const stopScrolling = () => {
    if (!isScrolling) {
      return;
    }
    const now = Date.now();
    totalScrollMs += now - scrollStart;
    isScrolling = false;
    scrollStart = 0;
  };

  const handleScroll = () => {
    if (document.hidden) {
      return;
    }

    scrollEvents += 1;
    maxScrollDepth = Math.max(maxScrollDepth, window.scrollY + window.innerHeight);

    if (!isScrolling) {
      isScrolling = true;
      scrollStart = Date.now();
    }

    if (scrollStopTimer) {
      clearTimeout(scrollStopTimer);
    }

    scrollStopTimer = setTimeout(stopScrolling, SCROLL_STOP_DELAY_MS);
  };

  const buildPayload = (reason) => {
    const now = Date.now();

    if (isScrolling) {
      totalScrollMs += now - scrollStart;
      scrollStart = now;
    }

    const activeMs = accumulatedVisibleMs + (visibleSince ? now - visibleSince : 0);

    const payload = {
      sessionId,
      reason,
      url: window.location.href,
      hostname: window.location.hostname,
      title: document.title,
      timestamp: new Date().toISOString(),
      activeMs,
      scrollMs: totalScrollMs,
      scrollEvents,
      maxScrollDepth,
      viewportHeight: window.innerHeight,
      documentHeight: document.documentElement.scrollHeight,
      devicePixelRatio: window.devicePixelRatio || 1,
    };

    accumulatedVisibleMs = 0;
    totalScrollMs = 0;
    scrollEvents = 0;
    maxScrollDepth = window.scrollY + window.innerHeight;

    if (visibleSince) {
      visibleSince = now;
    }

    return payload;
  };

  const sendUpdate = (reason) => {
    try {
      const payload = buildPayload(reason);
      chrome.runtime.sendMessage({ type: 'web-activity', payload });
    } catch (error) {
      console.warn('InTime extension failed to send update', error);
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  document.addEventListener('visibilitychange', updateVisibility);

  window.addEventListener(
    'beforeunload',
    () => {
      stopScrolling();
      sendUpdate('unload');
    },
    { once: true }
  );

  setInterval(() => {
    sendUpdate('interval');
  }, UPDATE_INTERVAL_MS);

  // Send initial heartbeat shortly after load
  setTimeout(() => {
    sendUpdate('initial');
  }, 5000);
})();


