import { timingSafeEqual } from 'node:crypto';
import { createAdminToken, isAdminAuthConfigured, verifyAdminToken } from '../server/adminAuth';
import { getAdminSupabaseClient, sendResponse } from './public-messages';

function hasValidAdminToken(req: any): boolean {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (typeof authHeader !== 'string') return false;

  const match = /^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/.exec(authHeader);
  return Boolean(match && verifyAdminToken(match[1]));
}

function passwordsMatch(input: string, configured: string): boolean {
  const inputDigest = Buffer.from(input, 'utf8');
  const configuredDigest = Buffer.from(configured, 'utf8');
  if (inputDigest.length !== configuredDigest.length) return false;
  return timingSafeEqual(inputDigest, configuredDigest);
}

function databaseUnavailable(res: any) {
  return sendResponse(res, 503, {
    success: false,
    error: 'Dịch vụ quản trị hiện chưa thể kết nối cơ sở dữ liệu.',
  });
}

export default async function handler(req: any, res: any) {
  const urlObj = new URL(req.url, 'http://localhost');
  const action = urlObj.searchParams.get('action');

  if (!isAdminAuthConfigured()) {
    return sendResponse(res, 503, {
      success: false,
      error: 'Dịch vụ quản trị hiện chưa được cấu hình.',
    });
  }

  if (req.method === 'POST' && action === 'login') {
    const inputPassword = typeof req.body?.password === 'string' ? req.body.password.trim() : '';
    const actualPassword = process.env.ADMIN_PASSWORD!.trim();

    if (passwordsMatch(inputPassword, actualPassword)) {
      const { token, expiresAt } = createAdminToken();
      return sendResponse(res, 200, { success: true, token, expiresAt });
    }

    return sendResponse(res, 401, {
      success: false,
      error: 'Mật khẩu quản trị không chính xác!',
    });
  }

  if (!hasValidAdminToken(req)) {
    return sendResponse(res, 401, {
      success: false,
      error: 'Phiên đăng nhập quản trị không hợp lệ hoặc đã hết hạn.',
    });
  }

  const supabase = getAdminSupabaseClient();
  if (!supabase) return databaseUnavailable(res);

  if (req.method === 'GET' && (action === 'messages' || !action)) {
    const { data, error } = await supabase
      .from('public_messages')
      .select('id, content, display_name, is_anonymous, is_pinned, is_hidden, created_at')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      console.warn('Supabase admin fetch failed:', error.message);
      return databaseUnavailable(res);
    }

    const messages = data.map((row) => ({
      id: row.id,
      content: row.content,
      displayName: row.display_name,
      isAnonymous: Boolean(row.is_anonymous),
      isPinned: Boolean(row.is_pinned),
      isHidden: Boolean(row.is_hidden),
      createdAt: row.created_at,
    }));
    return sendResponse(res, 200, { success: true, messages });
  }

  if (req.method === 'PATCH' && action === 'update') {
    const { id, isPinned, isHidden } = req.body || {};
    if (typeof id !== 'string' || !id) {
      return sendResponse(res, 400, { success: false, error: 'Thiếu ID lời chúc.' });
    }

    const updates: Record<string, boolean> = {};
    if (typeof isPinned === 'boolean') updates.is_pinned = isPinned;
    if (typeof isHidden === 'boolean') updates.is_hidden = isHidden;
    if (Object.keys(updates).length === 0) {
      return sendResponse(res, 400, { success: false, error: 'Không có trạng thái hợp lệ để cập nhật.' });
    }

    const { data, error } = await supabase
      .from('public_messages')
      .update(updates)
      .eq('id', id)
      .select('id, content, display_name, is_anonymous, is_pinned, is_hidden, created_at')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return sendResponse(res, 404, { success: false, error: 'Không tìm thấy lời chúc.' });
      }
      console.warn('Supabase admin update failed:', error.message);
      return databaseUnavailable(res);
    }

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

  if (req.method === 'DELETE' && action === 'delete') {
    const id = urlObj.searchParams.get('id') || req.body?.id;
    if (typeof id !== 'string' || !id) {
      return sendResponse(res, 400, { success: false, error: 'Thiếu ID lời chúc cần xóa.' });
    }

    const { error } = await supabase.from('public_messages').delete().eq('id', id);
    if (error) {
      console.warn('Supabase admin delete failed:', error.message);
      return databaseUnavailable(res);
    }
    return sendResponse(res, 200, { success: true, deletedId: id });
  }

  return sendResponse(res, 405, { error: 'Method Not Allowed' });
}
