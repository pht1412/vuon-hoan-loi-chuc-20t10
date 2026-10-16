import { PrivateJourneyData } from '../types/journey';

// Client-side rate limit tracking (đồng bộ từ response 429 của máy chủ)
let clientLockUntil = 0;

/**
 * Kiểm tra số giây bị khóa còn lại (nếu có)
 */
export function getRemainingLockSeconds(): number {
  const now = Date.now();
  if (now < clientLockUntil) {
    return Math.ceil((clientLockUntil - now) / 1000);
  }
  return 0;
}

/**
 * Gửi yêu cầu xác thực mật mã mở phong bì lên Serverless Function /api/unlock-journey
 * Dữ liệu 5 chặng chỉ được nạp từ Server về sau khi xác thực thành công.
 */
export async function verifyPasscodeAndLoadJourney(
  passcode: string
): Promise<PrivateJourneyData> {
  const remaining = getRemainingLockSeconds();
  if (remaining > 0) {
    throw new Error(
      `Cậu đã thử sai nhiều lần. Hãy đợi ${remaining} giây nữa rồi thử lại nhé 🌷`
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch('/api/unlock-journey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ passcode }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await res.json().catch(() => ({}));

    if (res.status === 200 && data.success && data.data) {
      // Mở khóa thành công: Xóa khóa tạm thời nếu có
      clientLockUntil = 0;
      return data.data as PrivateJourneyData;
    }

    if (res.status === 429) {
      const lockSec = data.remainingSeconds || 30;
      clientLockUntil = Date.now() + lockSec * 1000;
      throw new Error(
        data.error || 'Hình như mã mở cửa chưa đúng rồi. Cậu vui lòng đợi 30 giây rồi thử lại nhé 🌷'
      );
    }

    if (res.status === 401) {
      throw new Error(
        data.error || 'Hình như mã mở cửa chưa đúng rồi, cậu kiểm tra lại tin nhắn nhé 🌷'
      );
    }

    throw new Error(
      data.error || 'Không thể kết nối đến máy chủ. Cậu kiểm tra lại mạng và thử lại nhé.'
    );
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Thời gian kết nối quá lâu. Cậu vui lòng thử lại nhé.');
    }
    throw err;
  }
}
