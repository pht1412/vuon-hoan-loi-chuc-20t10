import { describe, expect, it } from 'vitest';
import { prependMessageIfMissing, PublicMessage } from '../src/types/message';

const existingMessage: PublicMessage = {
  id: 'existing',
  content: 'A previous message',
  displayName: null,
  isAnonymous: true,
  createdAt: '2026-10-18T10:00:00.000Z',
};

const sentMessage: PublicMessage = {
  id: 'new-message',
  content: 'A new message',
  displayName: 'A friend',
  isAnonymous: false,
  createdAt: '2026-10-18T11:00:00.000Z',
};

describe('prependMessageIfMissing', () => {
  it('does not add a message twice when Realtime inserts it before the API response', () => {
    const afterRealtime = prependMessageIfMissing([existingMessage], sentMessage);
    const afterApiResponse = prependMessageIfMissing(afterRealtime, sentMessage);

    expect(afterApiResponse).toEqual([sentMessage, existingMessage]);
    expect(afterApiResponse).toBe(afterRealtime);
  });

  it('does not add a message twice when the API response arrives before Realtime', () => {
    const afterApiResponse = prependMessageIfMissing([existingMessage], sentMessage);
    const afterRealtime = prependMessageIfMissing(afterApiResponse, sentMessage);

    expect(afterRealtime).toEqual([sentMessage, existingMessage]);
    expect(afterRealtime).toBe(afterApiResponse);
  });

  it('adds a new message at the start of the list', () => {
    expect(prependMessageIfMissing([existingMessage], sentMessage)).toEqual([
      sentMessage,
      existingMessage,
    ]);
  });
});
