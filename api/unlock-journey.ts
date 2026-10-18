import { privateJourneyContent } from '../server/privateData';

interface RateLimitState {
  failedAttempts: number;
  lockedUntil: number;
}

// In-memory rate limiting map theo địa chỉ IP
const ipRateLimits = new Map<string, RateLimitState>();

function getClientIp(req: any): string {
  const forwarded = req.headers?.['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].trim();
  }
  return req.headers?.['x-real-ip'] || req.socket?.remoteAddress || '127.0.0.1';
}

function sendResponse(res: any, status: number, data: any) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(status).json(data);
  }
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

export default async function handler(req: any, res: any) {
  // Chỉ hỗ trợ POST
  if (req.method !== 'POST') {
    return sendResponse(res, 405, { success: false, error: 'Method Not Allowed' });
  }

  const clientIp = getClientIp(req);
  const now = Date.now();

  let state = ipRateLimits.get(clientIp);
  if (!state) {
    state = { failedAttempts: 0, lockedUntil: 0 };
    ipRateLimits.set(clientIp, state);
  }

  // 1. Kiểm tra trạng thái khóa tạm thời (Rate Limit)
  if (now < state.lockedUntil) {
    const remainingSeconds = Math.ceil((state.lockedUntil - now) / 1000);
    return sendResponse(res, 429, {
      success: false,
      error: `Cậu đã thử sai nhiều lần. Hãy đợi ${remainingSeconds} giây nữa rồi thử lại nhé 🌷`,
      lockedUntil: state.lockedUntil,
      remainingSeconds,
    });
  }

  // 2. Kiểm tra mật khẩu mở cửa
  const body = req.body || {};
  const submittedPasscode = typeof body.passcode === 'string' ? body.passcode.trim().toLowerCase() : '';

  const configuredPasscode = process.env.PRIVATE_JOURNEY_PASSCODE?.trim().toLowerCase();
  if (!configuredPasscode) {
    return sendResponse(res, 503, {
      success: false,
      error: 'Hành trình riêng hiện chưa được cấu hình.',
    });
  }

  const isMatch = submittedPasscode === configuredPasscode;

  if (isMatch) {
    // Mở khóa thành công: Reset bộ đếm lỗi
    state.failedAttempts = 0;
    state.lockedUntil = 0;

    return sendResponse(res, 200, {
      success: true,
      data: privateJourneyContent,
    });
  }

  // 3. Xử lý sai mật khẩu
  state.failedAttempts += 1;
  if (state.failedAttempts >= 5) {
    state.lockedUntil = now + 30 * 1000; // Khóa 30 giây
    state.failedAttempts = 0;

    return sendResponse(res, 429, {
      success: false,
      error: 'Hình như mã mở cửa chưa đúng rồi. Cậu vui lòng đợi 30 giây rồi thử lại nhé 🌷',
      lockedUntil: state.lockedUntil,
      remainingSeconds: 30,
    });
  }

  return sendResponse(res, 401, {
    success: false,
    error: 'Hình như mã mở cửa chưa đúng rồi, cậu kiểm tra lại tin nhắn nhé 🌷',
    attemptsLeft: 5 - state.failedAttempts,
  });
}
