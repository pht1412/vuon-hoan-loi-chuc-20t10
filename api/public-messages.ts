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

// Khởi tạo Supabase client nếu có biến môi trường
export function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (url && key) {
    return createClient(url, key);
  }
  return null;
}

export function getAdminSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && serviceRoleKey) {
    return createClient(url, serviceRoleKey);
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
  if (!supabase) {
    return sendResponse(res, 503, {
      error: 'Dịch vụ lưu lời chúc hiện chưa được cấu hình.',
      code: 'SERVER_ERROR',
    });
  }

  // 1. GET: Lấy danh sách lời chúc công khai (chỉ lấy tin chưa ẩn, ưu tiên tin ghim trước)
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('public_messages')
      .select('id, content, display_name, is_anonymous, is_pinned, is_hidden, created_at')
      .eq('is_hidden', false)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.warn('Supabase public fetch failed:', error.message);
      return sendResponse(res, 503, {
        error: 'Không thể tải lời chúc lúc này. Vui lòng thử lại sau.',
        code: 'SERVER_ERROR',
      });
    }

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
    const { data: existing, error: idempotencyError } = await supabase
      .from('public_messages')
      .select('id, content, display_name, is_anonymous, is_pinned, is_hidden, created_at')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle();

    if (idempotencyError) {
      console.warn('Supabase idempotency lookup failed:', idempotencyError.message);
      return sendResponse(res, 503, {
        error: 'Chưa thể xác nhận trạng thái lời chúc. Vui lòng thử lại sau.',
        code: 'SERVER_ERROR',
      });
    }

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
    if (normalizedContent.length > 500) {
      return sendResponse(res, 400, {
        error: 'Nội dung lời chúc không được vượt quá 500 ký tự.',
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

    // F. Lưu dữ liệu mới
    const { data: inserted, error: insertError } = await supabase
      .from('public_messages')
      .insert([
        {
          content: normalizedContent,
          display_name: finalDisplayName,
          is_anonymous: isAnon,
          idempotency_key: idempotencyKey,
        },
      ])
      .select('id, content, display_name, is_anonymous, is_pinned, is_hidden, created_at')
      .single();

    if (insertError || !inserted) {
      console.warn('Supabase public insert failed:', insertError?.message ?? 'Missing response row');
      return sendResponse(res, 503, {
        error: 'Chưa thể lưu lời chúc. Vui lòng thử lại sau.',
        code: 'SERVER_ERROR',
      });
    }

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

  return sendResponse(res, 405, { error: 'Method Not Allowed' });
}
