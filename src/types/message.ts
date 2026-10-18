export interface PublicMessage {
  id: string;
  content: string;
  displayName: string | null;
  isAnonymous: boolean;
  isHidden?: boolean;
  isPinned?: boolean;
  createdAt: string;
}

export function prependMessageIfMissing(
  messages: PublicMessage[],
  newMessage: PublicMessage
): PublicMessage[] {
  if (messages.some((message) => message.id === newMessage.id)) {
    return messages;
  }
  return [newMessage, ...messages];
}

/**
 * Trả về tên hiển thị của người gửi theo quy tắc:
 * Nếu isAnonymous === true hoặc !displayName?.trim() -> hiển thị "Một người bạn"
 */
export function getSenderDisplayName(message: PublicMessage): string {
  if (message.isAnonymous || !message.displayName?.trim()) {
    return 'Một người bạn';
  }
  return message.displayName.trim();
}
