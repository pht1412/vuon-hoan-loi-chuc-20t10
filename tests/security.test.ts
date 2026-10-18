import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockCreateClient, mockFrom } = vi.hoisted(() => ({
  mockCreateClient: vi.fn(),
  mockFrom: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateClient,
}));

import adminHandler from '../api/admin';
import publicMessagesHandler from '../api/public-messages';
import unlockJourneyHandler from '../api/unlock-journey';
import { createAdminToken, verifyAdminToken } from '../server/adminAuth';

interface MockResponse {
  statusCode: number;
  body: unknown;
  status: (code: number) => MockResponse;
  json: (data: unknown) => MockResponse;
}

function createResponse(): MockResponse {
  const response: MockResponse = {
    statusCode: 200,
    body: undefined,
    status(code) {
      response.statusCode = code;
      return response;
    },
    json(data) {
      response.body = data;
      return response;
    },
  };
  return response;
}

function createDatabaseBuilder() {
  const builder: Record<string, ReturnType<typeof vi.fn>> = {};
  builder.select = vi.fn(() => builder);
  builder.eq = vi.fn(() => builder);
  builder.order = vi.fn(() => builder);
  builder.limit = vi.fn(() => Promise.resolve({ data: [], error: null }));
  builder.maybeSingle = vi.fn(() => Promise.resolve({ data: null, error: null }));
  builder.insert = vi.fn(() => builder);
  builder.update = vi.fn(() => builder);
  builder.delete = vi.fn(() => builder);
  builder.single = vi.fn(() => Promise.resolve({ data: null, error: null }));
  return builder;
}

describe('production security boundaries', () => {
  beforeEach(() => {
    mockCreateClient.mockReset().mockReturnValue({ from: mockFrom });
    mockFrom.mockReset().mockImplementation(() => createDatabaseBuilder());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('limits anonymous SQL privileges and visible rows in the Supabase migration', () => {
    const schema = readFileSync(new URL('../supabase/schema.sql', import.meta.url), 'utf8');

    expect(schema).toMatch(
      /REVOKE ALL PRIVILEGES ON TABLE public\.public_messages FROM PUBLIC, anon, authenticated;/i
    );
    expect(schema).toMatch(/GRANT SELECT ON TABLE public\.public_messages TO anon, authenticated;/i);
    expect(schema).toMatch(
      /GRANT INSERT \(content, display_name, is_anonymous, idempotency_key\)[\s\S]*TO anon, authenticated;/i
    );
    expect(schema).toMatch(/FOR SELECT\s+USING \(is_hidden = false\)/i);
    expect(schema).toMatch(/AND is_hidden = false\s+AND is_pinned = false/i);
    expect(schema).toMatch(/REPLICA IDENTITY DEFAULT/i);
    expect(schema).not.toMatch(/FOR UPDATE|FOR DELETE|REPLICA IDENTITY FULL/i);
  });

  it('rejects forged and payload-tampered admin tokens', () => {
    vi.stubEnv('ADMIN_TOKEN_SECRET', 'test-admin-token-secret-with-32-bytes');
    const forgedPayload = Buffer.from(
      JSON.stringify({ role: 'admin', exp: Date.now() + 60_000 })
    ).toString('base64url');
    expect(verifyAdminToken(`${forgedPayload}.${'a'.repeat(43)}`)).toBe(false);

    const now = 1_700_000_000_000;
    const { token, expiresAt } = createAdminToken(now);
    const [payload] = token.split('.');
    const tamperedPayload = Buffer.from(
      JSON.stringify({ role: 'user', exp: expiresAt })
    ).toString('base64url');
    expect(verifyAdminToken(`${tamperedPayload}.${token.split('.')[1]}`)).toBe(false);
    expect(verifyAdminToken(payload)).toBe(false);
    expect(verifyAdminToken(token, now)).toBe(true);
    expect(verifyAdminToken(token, expiresAt)).toBe(false);
  });

  it('does not fall back to a default admin password when auth settings are missing', async () => {
    vi.stubEnv('ADMIN_PASSWORD', '');
    vi.stubEnv('ADMIN_TOKEN_SECRET', '');
    const response = createResponse();

    await adminHandler(
      {
        method: 'POST',
        url: '/api/admin?action=login',
        body: { password: 'admin2010' },
        headers: {},
      },
      response
    );

    expect(response.statusCode).toBe(503);
    expect(response.body).not.toHaveProperty('token');
  });

  it('issues a signed token for the configured Admin password', async () => {
    vi.stubEnv('ADMIN_PASSWORD', 'configured-test-password');
    vi.stubEnv('ADMIN_TOKEN_SECRET', 'test-admin-token-secret-with-32-bytes');
    const response = createResponse();

    await adminHandler(
      {
        method: 'POST',
        url: '/api/admin?action=login',
        body: { password: 'configured-test-password' },
        headers: {},
      },
      response
    );

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({ success: true });
    expect(verifyAdminToken((response.body as { token: string }).token)).toBe(true);
  });

  it.each([
    ['GET', '/api/admin?action=messages'],
    ['PATCH', '/api/admin?action=update'],
    ['DELETE', '/api/admin?action=delete&id=message-id'],
  ])('requires a signed token for Admin %s requests', async (method, url) => {
    vi.stubEnv('ADMIN_PASSWORD', 'configured-test-password');
    vi.stubEnv('ADMIN_TOKEN_SECRET', 'test-admin-token-secret-with-32-bytes');
    const payload = Buffer.from(
      JSON.stringify({ role: 'admin', exp: Date.now() + 60_000 })
    ).toString('base64url');
    const response = createResponse();

    await adminHandler(
      { method, url, headers: { authorization: `Bearer ${payload}.forged` }, body: {} },
      response
    );

    expect(response.statusCode).toBe(401);
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it('refuses Admin data access without a server-side service-role key', async () => {
    vi.stubEnv('ADMIN_PASSWORD', 'configured-test-password');
    vi.stubEnv('ADMIN_TOKEN_SECRET', 'test-admin-token-secret-with-32-bytes');
    vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');
    const { token } = createAdminToken();
    const response = createResponse();

    await adminHandler(
      {
        method: 'GET',
        url: '/api/admin?action=messages',
        headers: { authorization: `Bearer ${token}` },
      },
      response
    );

    expect(response.statusCode).toBe(503);
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it('uses the server-only service-role key for authenticated Admin reads', async () => {
    vi.stubEnv('ADMIN_PASSWORD', 'configured-test-password');
    vi.stubEnv('ADMIN_TOKEN_SECRET', 'test-admin-token-secret-with-32-bytes');
    vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-server-service-role-key');
    const builder = createDatabaseBuilder();
    builder.limit.mockResolvedValue({ data: [], error: null });
    mockFrom.mockReturnValue(builder);
    const { token } = createAdminToken();
    const response = createResponse();

    await adminHandler(
      {
        method: 'GET',
        url: '/api/admin?action=messages',
        headers: { authorization: `Bearer ${token}` },
      },
      response
    );

    expect(response.statusCode).toBe(200);
    expect(mockCreateClient).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'test-server-service-role-key'
    );
    expect(response.body).not.toHaveProperty('serviceRoleKey');
  });

  it('does not unlock the journey with tu-do when another passcode is configured', async () => {
    vi.stubEnv('PRIVATE_JOURNEY_PASSCODE', 'configured-test-passcode');
    const response = createResponse();

    await unlockJourneyHandler(
      {
        method: 'POST',
        url: '/api/unlock-journey',
        headers: { 'x-forwarded-for': `198.51.100.${Date.now() % 255}` },
        body: { passcode: 'tu-do' },
      },
      response
    );

    expect(response.statusCode).toBe(401);
    expect(response.body).not.toHaveProperty('data');
  });

  it('does not return private journey content when its passcode is not configured', async () => {
    vi.stubEnv('PRIVATE_JOURNEY_PASSCODE', '');
    const response = createResponse();

    await unlockJourneyHandler(
      {
        method: 'POST',
        url: '/api/unlock-journey',
        headers: { 'x-forwarded-for': `203.0.113.${Date.now() % 255}` },
        body: { passcode: '2010' },
      },
      response
    );

    expect(response.statusCode).toBe(503);
    expect(response.body).not.toHaveProperty('data');
  });

  it('returns an error instead of success when Supabase fails to persist a message', async () => {
    vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('SUPABASE_ANON_KEY', 'test-public-anon-key');
    const builder = createDatabaseBuilder();
    builder.single.mockResolvedValue({
      data: null,
      error: { message: 'database unavailable', code: '503' },
    });
    mockFrom.mockReturnValue(builder);
    const response = createResponse();

    await publicMessagesHandler(
      {
        method: 'POST',
        url: '/api/public-messages',
        body: {
          content: 'Lời chúc kiểm thử hợp lệ',
          isAnonymous: true,
          idempotencyKey: '00000000-0000-4000-8000-000000000001',
        },
      },
      response
    );

    expect(response.statusCode).toBe(503);
    expect(response.body).toMatchObject({ code: 'SERVER_ERROR' });
    expect(response.body).not.toHaveProperty('id');
    expect(builder.insert).toHaveBeenCalledWith([
      expect.objectContaining({ content: 'Lời chúc kiểm thử hợp lệ' }),
    ]);
    expect(builder.insert.mock.calls[0][0][0]).not.toHaveProperty('is_hidden');
    expect(builder.insert.mock.calls[0][0][0]).not.toHaveProperty('is_pinned');
  });

  it('returns an error rather than an empty success when public database settings are missing', async () => {
    vi.stubEnv('SUPABASE_URL', '');
    vi.stubEnv('SUPABASE_ANON_KEY', '');
    const response = createResponse();

    await publicMessagesHandler(
      { method: 'GET', url: '/api/public-messages' },
      response
    );

    expect(response.statusCode).toBe(503);
  });
});
