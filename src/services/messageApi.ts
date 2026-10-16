import { PublicMessage } from '../types/message';
import { initialPublicMessages } from '../data/publicMessages';

export interface CreateMessageRequest {
  content: string;
  displayName?: string | null;
  isAnonymous: boolean;
  idempotencyKey: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: 'VALIDATION_ERROR' | 'SERVER_ERROR' | 'TIMEOUT_ERROR'
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Lấy danh sách lời chúc công khai từ Vercel Serverless Function /api/public-messages
 * Tự động fallback về initialPublicMessages nếu gặp sự cố mạng
 */
export async function fetchPublicMessages(): Promise<PublicMessage[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch('/api/public-messages', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data as PublicMessage[];
      }
    }
    return initialPublicMessages;
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('Không thể tải lời chúc từ máy chủ, dùng danh sách mẫu ban đầu:', err);
    return initialPublicMessages;
  }
}

/**
 * Gửi một lời chúc công khai mới qua Vercel Serverless Function /api/public-messages
 * Hỗ trợ Idempotency Key và ánh xạ lỗi chuẩn xác
 */
export async function createPublicMessage(
  request: CreateMessageRequest
): Promise<PublicMessage> {
  const { content, displayName, isAnonymous, idempotencyKey } = request;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch('/api/public-messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        content,
        displayName,
        isAnonymous,
        idempotencyKey,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await res.json().catch(() => ({}));

    if (res.status === 200 || res.status === 201) {
      return data as PublicMessage;
    }

    if (res.status === 504 || data.code === 'TIMEOUT_ERROR') {
      throw new ApiError(
        data.error || 'Không thể nhận phản hồi từ máy chủ do quá thời gian chờ (Timeout).',
        'TIMEOUT_ERROR'
      );
    }

    if (res.status === 400 || data.code === 'VALIDATION_ERROR') {
      throw new ApiError(
        data.error || 'Dữ liệu gửi lên không hợp lệ.',
        'VALIDATION_ERROR'
      );
    }

    throw new ApiError(
      data.error || 'Hệ thống đang quá tải hoặc gặp sự cố xử lý. Vui lòng thử lại sau giây lát.',
      'SERVER_ERROR'
    );
  } catch (err: any) {
    clearTimeout(timeoutId);

    if (err instanceof ApiError) {
      throw err;
    }

    if (err.name === 'AbortError') {
      throw new ApiError(
        'Không thể nhận phản hồi từ máy chủ do quá thời gian chờ (Timeout).',
        'TIMEOUT_ERROR'
      );
    }

    throw new ApiError(
      err.message || 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.',
      'SERVER_ERROR'
    );
  }
}

/**
 * Helper sinh UUID v4 an toàn
 */
export function generateIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'key-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
}
