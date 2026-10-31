import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const syncService = require('../server/services/sync.service');
const cronSyncHandler = require('../api/cron/sync');

process.env.JWT_SECRET = 'test_jwt_secret_key_12345678901234567890';
process.env.SESSION_SECRET = 'test_session_secret_key_123456789012345';
process.env.ENCRYPTION_KEY = '12345678901234567890123456789012';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.CRON_SECRET = 'super_secret_cron_token_devact_2026';
process.env.MONGO_URI = 'mongodb://localhost:27017/test_devact';

describe('Cron Sync Endpoint (/api/cron/sync)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.CRON_SECRET = 'super_secret_cron_token_devact_2026';
    // Provide a mocked cached connection so connectDB() returns instantly without network
    global.mongoose = {
      conn: { connection: { host: 'cluster0.mock.mongodb.net' } },
      promise: null,
    };
  });

  it('rejects unsupported HTTP methods with 405', async () => {
    const req = { method: 'DELETE', headers: {} };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await cronSyncHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ message: 'Method Not Allowed' });
  });

  it('returns 500 if CRON_SECRET is not configured on server', async () => {
    delete process.env.CRON_SECRET;

    const req = {
      method: 'POST',
      headers: { authorization: 'Bearer some_secret' },
    };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await cronSyncHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'CRON_SECRET is not configured' });
  });

  it('returns 401 when Authorization header is missing', async () => {
    const req = {
      method: 'POST',
      headers: {},
    };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await cronSyncHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
  });

  it('returns 401 when Bearer token is invalid', async () => {
    const req = {
      method: 'POST',
      headers: { authorization: 'Bearer wrong_token' },
    };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await cronSyncHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
  });

  it('authenticates and executes bounded sync with valid CRON_SECRET', async () => {
    const mockSyncResult = {
      totalEligible: 5,
      skippedRecent: 2,
      processed: 3,
      successful: 3,
      failed: 0,
      errors: [],
    };
    vi.spyOn(syncService, 'syncAllUsers').mockResolvedValue(mockSyncResult);

    const req = {
      method: 'POST',
      headers: { authorization: 'Bearer super_secret_cron_token_devact_2026' },
      query: { limit: '5', skipSyncedWithin: '60' },
    };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await cronSyncHandler(req, res);

    expect(syncService.syncAllUsers).toHaveBeenCalledWith({
      limit: 5,
      skipSyncedWithinMinutes: 60,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ok',
        result: mockSyncResult,
      })
    );
  });

  it('handles execution failures and returns 500 status', async () => {
    vi.spyOn(syncService, 'syncAllUsers').mockRejectedValue(new Error('Sync service timeout'));

    const req = {
      method: 'POST',
      headers: { authorization: 'Bearer super_secret_cron_token_devact_2026' },
      query: {},
    };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await cronSyncHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Sync service timeout',
    });
  });
});
