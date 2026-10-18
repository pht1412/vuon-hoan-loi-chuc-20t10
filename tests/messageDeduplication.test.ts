import { describe, expect, it } from 'vitest';
import {
  prependMessageIfMissing,
  prioritizeTemporaryMessages,
  PublicMessage,
} from '../src/types/message';

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

describe('temporary new-message priority', () => {
  const pinnedMessage: PublicMessage = {
    id: 'pinned-message',
    content: 'A pinned message',
    displayName: 'A sender',
    isAnonymous: false,
    isPinned: true,
    createdAt: '2026-10-17T10:00:00.000Z',
  };

  it('briefly shows a newly received message before pinned messages', () => {
    const normallySortedMessages = [pinnedMessage, sentMessage];

    expect(prioritizeTemporaryMessages(normallySortedMessages, [sentMessage.id])).toEqual([
      sentMessage,
      pinnedMessage,
    ]);
  });

  it('restores pinned messages to the top after the temporary highlight expires', () => {
    const normallySortedMessages = [pinnedMessage, sentMessage];

    expect(prioritizeTemporaryMessages(normallySortedMessages, [])).toEqual([
      pinnedMessage,
      sentMessage,
    ]);
  });
});
