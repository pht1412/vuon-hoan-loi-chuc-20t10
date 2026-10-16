import { getSupabaseClient, sendResponse, inMemoryMessages } from './public-messages';

// Thời gian hiệu lực token quản trị: 24 giờ
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function verifyAdminToken(req: any): boolean {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (!authHeader || typeof authHeader !== 'string') {
    return false;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return false;
  }

  try {
    const raw = Buffer.from(parts[1], 'base64').toString('utf-8');
    const payload = JSON.parse(raw);
    if (payload.role === 'admin' && typeof payload.exp === 'number' && payload.exp > Date.now()) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

export default async function handler(req: any, res: any) {
  const urlObj = new URL(req.url, 'http://localhost');
  const action = urlObj.searchParams.get('action');

  // 1. Đăng nhập Quản trị viên
  if (req.method === 'POST' && action === 'login') {
    const body = req.body || {};
    const inputPassword = typeof body.password === 'string' ? body.password.trim() : '';
    const actualPassword = (process.env.ADMIN_PASSWORD || 'admin2010').trim();

    if (inputPassword === actualPassword) {
      const payload = {
        role: 'admin',
        exp: Date.now() + TOKEN_TTL_MS,
      };
      const token = Buffer.from(JSON.stringify(payload)).toString('base64');
      return sendResponse(res, 200, {
        success: true,
        token,
        expiresAt: payload.exp,
      });
    }

    return sendResponse(res, 401, {
      success: false,
      error: 'Mật khẩu quản trị không chính xác!',
    });
  }

  // 2. Mọi thao tác quản trị khác đều yêu cầu xác thực Bearer Token
  if (!verifyAdminToken(req)) {
    return sendResponse(res, 401, {
      success: false,
      error: 'Phiên đăng nhập quản trị không hợp lệ hoặc đã hết hạn.',
    });
  }

  const supabase = getSupabaseClient();

  // 3. GET: Lấy danh sách toàn bộ lời chúc (kể cả đã ẩn)
  if (req.method === 'GET' && (action === 'messages' || !action)) {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('public_messages')
          .select('id, content, display_name, is_anonymous, is_pinned, is_hidden, created_at')
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(200);

        if (!error && Array.isArray(data)) {
          const list = data.map((row) => ({
            id: row.id,
            content: row.content,
            displayName: row.display_name,
            isAnonymous: Boolean(row.is_anonymous),
            isPinned: Boolean(row.is_pinned),
            isHidden: Boolean(row.is_hidden),
            createdAt: row.created_at,
          }));
          return sendResponse(res, 200, { success: true, messages: list });
        }
      } catch (err) {
        console.warn('Supabase admin fetch error:', err);
      }
    }

    // In-memory fallback
    const list = [...inMemoryMessages].sort((a, b) => {
      if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1;
      return b.createdAt.localeCompare(a.createdAt);
    });
    return sendResponse(res, 200, { success: true, messages: list });
  }

  // 4. PATCH: Cập nhật trạng thái Ghim hoặc Ẩn
  if (req.method === 'PATCH' && action === 'update') {
    const body = req.body || {};
    const { id, isPinned, isHidden } = body;

    if (!id) {
      return sendResponse(res, 400, { success: false, error: 'Thiếu ID lời chúc.' });
    }

    const updates: Record<string, boolean> = {};
    if (typeof isPinned === 'boolean') updates.is_pinned = isPinned;
    if (typeof isHidden === 'boolean') updates.is_hidden = isHidden;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('public_messages')
          .update(updates)
          .eq('id', id)
          .select('id, content, display_name, is_anonymous, is_pinned, is_hidden, created_at')
          .single();

        if (!error && data) {
          return sendResponse(res, 200, {
            success: true,
            message: {
              id: data.id,
              content: data.content,
              displayName: data.display_name,
              isAnonymous: Boolean(data.is_anonymous),
              isPinned: Boolean(data.is_pinned),
              isHidden: Boolean(data.is_hidden),
              createdAt: data.created_at,
            },
          });
        }
      } catch (err) {
        console.warn('Supabase admin update error:', err);
      }
    }

    // In-memory fallback update
    const target = inMemoryMessages.find((m) => m.id === id);
    if (target) {
      if (typeof isPinned === 'boolean') target.isPinned = isPinned;
      if (typeof isHidden === 'boolean') target.isHidden = isHidden;
      return sendResponse(res, 200, { success: true, message: target });
    }

    return sendResponse(res, 404, { success: false, error: 'Không tìm thấy lời chúc.' });
  }

  // 5. DELETE: Xóa vĩnh viễn lời chúc
  if (req.method === 'DELETE' && action === 'delete') {
    const id = urlObj.searchParams.get('id') || req.body?.id;
    if (!id) {
      return sendResponse(res, 400, { success: false, error: 'Thiếu ID lời chúc cần xóa.' });
    }

    if (supabase) {
      try {
        const { error } = await supabase.from('public_messages').delete().eq('id', id);
        if (!error) {
          return sendResponse(res, 200, { success: true, deletedId: id });
        }
      } catch (err) {
        console.warn('Supabase admin delete error:', err);
      }
    }

    // In-memory fallback delete
    const idx = inMemoryMessages.findIndex((m) => m.id === id);
    if (idx !== -1) {
      inMemoryMessages.splice(idx, 1);
      return sendResponse(res, 200, { success: true, deletedId: id });
    }

    return sendResponse(res, 404, { success: false, error: 'Không tìm thấy lời chúc.' });
  }

  return sendResponse(res, 405, { error: 'Method Not Allowed' });
}
