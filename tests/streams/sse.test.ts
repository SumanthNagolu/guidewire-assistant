/// <reference types="vitest" />

import { describe, expect, test } from 'vitest';
import { extractSSEEvents } from '../../lib/streams/sse';

describe('extractSSEEvents', () => {
  test('returns complete events and preserves remainder', () => {
    const input =
      'event: token\ndata: {"value":"Hel"}\n\n' +
      'event: token\ndata: {"value":"lo"}\n\n' +
      'event: token\ndata: {"value":" "}\n\n' +
      'event: token\n';

    const { events, buffer } = extractSSEEvents(input);

    expect(events).toHaveLength(3);
    expect(events[0]).toEqual({ type: 'token', data: '{"value":"Hel"}' });
    expect(events[1]).toEqual({ type: 'token', data: '{"value":"lo"}' });
    expect(events[2]).toEqual({ type: 'token', data: '{"value":" "}' });
    expect(buffer).toBe('event: token\n');
  });

  test('merges multi-line data payloads', () => {
    const input =
      'event: token\n' +
      'data: {"value":"Line 1"}\n' +
      'data: {\"continuation\":true}\n\n';

    const { events, buffer } = extractSSEEvents(input);

    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({
      type: 'token',
      data: '{"value":"Line 1"}\n{\"continuation\":true}',
    });
    expect(buffer).toBe('');
  });

  test('ignores comment lines and empty frames', () => {
    const input = ':keep-alive\n\n\n';

    const { events, buffer } = extractSSEEvents(input);

    expect(events).toHaveLength(0);
    expect(buffer).toBe('');
  });
});

