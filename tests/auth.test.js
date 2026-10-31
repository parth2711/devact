import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const jwt = require('jsonwebtoken');

// Set test environment variables
process.env.JWT_SECRET = 'test_jwt_secret_key_12345678901234567890';
process.env.SESSION_SECRET = 'test_session_secret_key_123456789012345';
process.env.ENCRYPTION_KEY = '12345678901234567890123456789012';
process.env.FRONTEND_URL = 'http://localhost:5173';

const { protect } = require('../server/middleware/auth.middleware');
const User = require('../server/models/User');

describe('Authentication & JWT Security', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('JWT Algorithm Enforcement', () => {
    it('signs tokens with HS256 algorithm', () => {
      const token = jwt.sign({ id: 'user_123' }, process.env.JWT_SECRET, {
        algorithm: 'HS256',
        expiresIn: '1h',
      });

      const decodedHeader = JSON.parse(Buffer.from(token.split('.')[0], 'base64').toString('utf8'));
      expect(decodedHeader.alg).toBe('HS256');
    });

    it('verifies tokens with explicit HS256 algorithm constraint', () => {
      const token = jwt.sign({ id: 'user_123' }, process.env.JWT_SECRET, {
        algorithm: 'HS256',
        expiresIn: '1h',
      });

      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ['HS256'],
      });
      expect(decoded.id).toBe('user_123');
    });

    it('rejects tokens signed with none algorithm', () => {
      // Craft an unverified/none token
      const unsignedHeader = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
      const payload = Buffer.from(JSON.stringify({ id: 'user_123' })).toString('base64url');
      const fakeToken = `${unsignedHeader}.${payload}.`;

      expect(() => {
        jwt.verify(fakeToken, process.env.JWT_SECRET, { algorithms: ['HS256'] });
      }).toThrow();
    });

    it('rejects expired tokens', () => {
      const expiredToken = jwt.sign({ id: 'user_123' }, process.env.JWT_SECRET, {
        algorithm: 'HS256',
        expiresIn: '-1s',
      });

      expect(() => {
        jwt.verify(expiredToken, process.env.JWT_SECRET, { algorithms: ['HS256'] });
      }).toThrow();
    });
  });

  describe('Auth Middleware (protect)', () => {
    it('returns 401 when no token is present', async () => {
      const req = { cookies: {}, headers: {} };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized' });
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 401 when token is invalid', async () => {
      const req = {
        cookies: { token: 'invalid.jwt.token' },
        headers: {},
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, token failed' });
      expect(next).not.toHaveBeenCalled();
    });

    it('authenticates user and calls next() when token and user are valid', async () => {
      const mockUser = { _id: 'user_456', name: 'Test Developer', email: 'test@devact.io' };
      vi.spyOn(User, 'findById').mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      });

      const token = jwt.sign({ id: 'user_456' }, process.env.JWT_SECRET, {
        algorithm: 'HS256',
        expiresIn: '1h',
      });

      const req = {
        cookies: { token },
        headers: {},
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      await protect(req, res, next);

      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('returns 401 when user no longer exists in database', async () => {
      vi.spyOn(User, 'findById').mockReturnValue({
        select: vi.fn().mockResolvedValue(null),
      });

      const token = jwt.sign({ id: 'deleted_user' }, process.env.JWT_SECRET, {
        algorithm: 'HS256',
        expiresIn: '1h',
      });

      const req = {
        cookies: { token },
        headers: {},
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'User no longer exists' });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
