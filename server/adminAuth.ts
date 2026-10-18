import { createHmac, timingSafeEqual } from 'node:crypto';

export const ADMIN_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const ADMIN_ROLE = 'admin';

export function isAdminAuthConfigured(): boolean {
  const password = process.env.ADMIN_PASSWORD?.trim();
  const secret = process.env.ADMIN_TOKEN_SECRET;
  return Boolean(password && secret && Buffer.byteLength(secret, 'utf8') >= 32);
}

export function createAdminToken(now = Date.now()): { token: string; expiresAt: number } {
  const expiresAt = now + ADMIN_TOKEN_TTL_MS;
  const payload = Buffer.from(
    JSON.stringify({ role: ADMIN_ROLE, exp: expiresAt }),
    'utf8'
  ).toString('base64url');
  const signature = sign(payload);
  return { token: `${payload}.${signature}`, expiresAt };
}

export function verifyAdminToken(token: string, now = Date.now()): boolean {
  const secret = process.env.ADMIN_TOKEN_SECRET;
  if (!secret || Buffer.byteLength(secret, 'utf8') < 32) return false;

  const parts = token.split('.');
  if (
    parts.length !== 2 ||
    !/^[A-Za-z0-9_-]+$/.test(parts[0]) ||
    !/^[A-Za-z0-9_-]{43}$/.test(parts[1])
  ) {
    return false;
  }

  const expected = Buffer.from(sign(parts[0]), 'base64url');
  const supplied = Buffer.from(parts[1], 'base64url');
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) {
    return false;
  }

  try {
    const payload: unknown = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    if (!payload || typeof payload !== 'object') return false;

    const claims = payload as { role?: unknown; exp?: unknown };
    return claims.role === ADMIN_ROLE && Number.isSafeInteger(claims.exp) && (claims.exp as number) > now;
  } catch {
    return false;
  }
}

function sign(payload: string): string {
  return createHmac('sha256', process.env.ADMIN_TOKEN_SECRET!)
    .update(payload)
    .digest('base64url');
}
