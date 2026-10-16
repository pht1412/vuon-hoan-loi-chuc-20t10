import { createClient } from '@supabase/supabase-js';

export interface PublicMessageDto {
  id: string;
  content: string;
  displayName: string | null;
  isAnonymous: boolean;
  isPinned?: boolean;
  isHidden?: boolean;
  createdAt: string;
}

// Danh sách lưu trữ ban đầu trống cho môi trường thực tế (Production)
export const inMemoryMessages: PublicMessageDto[] = [];

export const inMemoryIdempotencyStore = new Map<string, PublicMessageDto>();
const timeoutSimulatedKeys = new Set<string>();

// Khởi tạo Supabase client nếu có biến môi trường
export function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (url && key) {
    try {
      return createClient(url, key);
    } catch (err) {
      console.warn('Không thể khởi tạo Supabase client, chuyển sang in-memory fallback:', err);
    }
  }
  return null;
}

export function sendResponse(res: any, status: number, data: any) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(status).json(data);
  }
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

export default async function handler(req: any, res: any) {
  const supabase = getSupabaseClient();

  // 1. GET: Lấy danh sách lời chúc công khai (chỉ lấy tin chưa ẩn, ưu tiên tin ghim trước)
  if (req.method === 'GET') {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('public_messages')
          .select('id, content, display_name, is_anonymous, is_pinned, is_hidden, created_at')
          .eq('is_hidden', false)
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(100);

        if (!error && Array.isArray(data)) {
          const formatted: PublicMessageDto[] = data.map((row) => ({
            id: row.id,
            content: row.content,
            displayName: row.display_name,
            isAnonymous: Boolean(row.is_anonymous),
            isPinned: Boolean(row.is_pinned),
            isHidden: Boolean(row.is_hidden),
            createdAt: row.created_at,
          }));
          return sendResponse(res, 200, formatted);
        }
        console.warn('Lỗi truy vấn Supabase, fallback sang In-Memory:', error);
      } catch (err) {
        console.warn('Supabase fetch error, fallback sang In-Memory:', err);
      }
    }

    // In-memory fallback: lọc tin chưa ẩn, ưu tiên tin ghim
    const visibleMessages = inMemoryMessages
      .filter((m) => !m.isHidden)
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) {
          return b.isPinned ? 1 : -1;
        }
        return b.createdAt.localeCompare(a.createdAt);
      })
      .slice(0, 100);

    return sendResponse(res, 200, visibleMessages);
  }

  // 2. POST: Gửi một lời chúc công khai
  if (req.method === 'POST') {
    const body = req.body || {};
    const { content, displayName, isAnonymous, idempotencyKey } = body;

    // A. Validate idempotencyKey
    if (!idempotencyKey || typeof idempotencyKey !== 'string') {
      return sendResponse(res, 400, {
        error: 'Thiếu idempotencyKey hợp lệ.',
        code: 'VALIDATION_ERROR',
      });
    }

    // B. Kiểm tra Idempotency Key trước khi làm việc nặng
    if (supabase) {
      try {
        const { data: existing } = await supabase
          .from('public_messages')
          .select('id, content, display_name, is_anonymous, is_pinned, is_hidden, created_at')
          .eq('idempotency_key', idempotencyKey)
          .maybeSingle();

        if (existing) {
          return sendResponse(res, 200, {
            id: existing.id,
            content: existing.content,
            displayName: existing.display_name,
            isAnonymous: Boolean(existing.is_anonymous),
            isPinned: Boolean(existing.is_pinned),
            isHidden: Boolean(existing.is_hidden),
            createdAt: existing.created_at,
          });
        }
      } catch (err) {
        console.warn('Supabase idempotency check fallback:', err);
      }
    }

    if (inMemoryIdempotencyStore.has(idempotencyKey)) {
      return sendResponse(res, 200, inMemoryIdempotencyStore.get(idempotencyKey)!);
    }

    // C. Validate & Chuẩn hóa dữ liệu phía server
    const rawContent = typeof content === 'string' ? content : '';
    const normalizedContent = rawContent
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (normalizedContent.length < 3) {
      return sendResponse(res, 400, {
        error: 'Nội dung lời chúc phải có ít nhất 3 ký tự.',
        code: 'VALIDATION_ERROR',
      });
    }
    if (normalizedContent.length > 300) {
      return sendResponse(res, 400, {
        error: 'Nội dung lời chúc không được vượt quá 300 ký tự.',
        code: 'VALIDATION_ERROR',
      });
    }

    let finalDisplayName: string | null = null;
    const isAnon = Boolean(isAnonymous);
    if (!isAnon && displayName && typeof displayName === 'string') {
      const trimmedName = displayName.replace(/\s+/g, ' ').trim();
      if (trimmedName.length > 40) {
        return sendResponse(res, 400, {
          error: 'Tên hiển thị không được vượt quá 40 ký tự.',
          code: 'VALIDATION_ERROR',
        });
      }
      finalDisplayName = trimmedName || null;
    }

    // D. Dev Simulation: [test:error]
    if (normalizedContent.includes('[test:error]')) {
      return sendResponse(res, 500, {
        error: 'Hệ thống đang quá tải hoặc gặp sự cố xử lý. Vui lòng thử lại sau giây lát.',
        code: 'SERVER_ERROR',
      });
    }

    // E. Dev Simulation: [test:timeout]
    if (normalizedContent.includes('[test:timeout]')) {
      if (!timeoutSimulatedKeys.has(idempotencyKey)) {
        timeoutSimulatedKeys.add(idempotencyKey);

        const simulatedMessage: PublicMessageDto = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          content: normalizedContent,
          displayName: finalDisplayName,
          isAnonymous: isAnon,
          isPinned: false,
          isHidden: false,
          createdAt: new Date().toISOString(),
        };
        inMemoryIdempotencyStore.set(idempotencyKey, simulatedMessage);
        inMemoryMessages.unshift(simulatedMessage);

        return sendResponse(res, 504, {
          error: 'Không thể nhận phản hồi từ máy chủ do quá thời gian chờ (Timeout).',
          code: 'TIMEOUT_ERROR',
        });
      }
    }

    // F. Lưu dữ liệu mới
    if (supabase) {
      try {
        const { data: inserted, error: insertError } = await supabase
          .from('public_messages')
          .insert([
            {
              content: normalizedContent,
              display_name: finalDisplayName,
              is_anonymous: isAnon,
              is_pinned: false,
              is_hidden: false,
              idempotency_key: idempotencyKey,
            },
          ])
          .select('id, content, display_name, is_anonymous, is_pinned, is_hidden, created_at')
          .single();

        if (!insertError && inserted) {
          const result: PublicMessageDto = {
            id: inserted.id,
            content: inserted.content,
            displayName: inserted.display_name,
            isAnonymous: Boolean(inserted.is_anonymous),
            isPinned: Boolean(inserted.is_pinned),
            isHidden: Boolean(inserted.is_hidden),
            createdAt: inserted.created_at,
          };
          return sendResponse(res, 201, result);
        }
        console.warn('Supabase insert error, fallback sang In-Memory:', insertError);
      } catch (err) {
        console.warn('Supabase insert exception, fallback sang In-Memory:', err);
      }
    }

    // In-memory save fallback
    const newMessage: PublicMessageDto = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      content: normalizedContent,
      displayName: finalDisplayName,
      isAnonymous: isAnon,
      isPinned: false,
      isHidden: false,
      createdAt: new Date().toISOString(),
    };

    inMemoryMessages.unshift(newMessage);
    inMemoryIdempotencyStore.set(idempotencyKey, newMessage);

    return sendResponse(res, 201, newMessage);
  }

  return sendResponse(res, 405, { error: 'Method Not Allowed' });
}
