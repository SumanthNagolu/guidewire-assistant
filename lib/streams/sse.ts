export interface SSEEvent {
  type: string;
  data: string;
}

interface ParseResult {
  events: SSEEvent[];
  buffer: string;
}

/**
 * Parse a buffer of text for Server-Sent Events (SSE) and return complete events
 * alongside the remaining buffer (partial event).
 */
export function extractSSEEvents(buffer: string): ParseResult {
  const events: SSEEvent[] = [];
  let remaining = buffer;

  while (true) {
    const separatorIndex = remaining.indexOf('\n\n');
    if (separatorIndex === -1) {
      break;
    }

    const rawEvent = remaining.slice(0, separatorIndex);
    remaining = remaining.slice(separatorIndex + 2);

    if (!rawEvent.trim()) {
      continue;
    }

    const lines = rawEvent.split('\n');
    let eventType = 'message';
    const dataLines: string[] = [];

    for (const line of lines) {
      if (!line) {
        continue;
      }

      if (line.startsWith(':')) {
        // Comment/heartbeat line, ignore.
        continue;
      }

      if (line.startsWith('event:')) {
        eventType = line.slice(6).trim();
        continue;
      }

      if (line.startsWith('data:')) {
        dataLines.push(line.slice(5).trimStart());
      }
    }

    events.push({
      type: eventType,
      data: dataLines.join('\n'),
    });
  }

  return { events, buffer: remaining };
}

