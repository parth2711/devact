import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRequire } from 'module';
import path from 'path';

const require = createRequire(import.meta.url);
let mongoose;
try {
  mongoose = require(path.resolve(process.cwd(), 'server/node_modules/mongoose'));
} catch {
  mongoose = require('mongoose');
}
const connectDB = require('../server/config/db');

process.env.MONGO_URI = 'mongodb://localhost:27017/test_devact';

describe('Database Connection Pooling & Caching', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.mongoose = { conn: null, promise: null };
  });

  it('uses maxPoolSize: 10 and serverless connection options', async () => {
    const mockMongooseInstance = {
      connection: { host: 'cluster0.mock.mongodb.net' },
    };

    const connectSpy = vi.spyOn(mongoose, 'connect').mockResolvedValue(mockMongooseInstance);

    const conn = await connectDB();

    expect(connectSpy).toHaveBeenCalledTimes(1);
    expect(connectSpy).toHaveBeenCalledWith(
      process.env.MONGO_URI,
      expect.objectContaining({
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      })
    );
    expect(conn).toBe(mockMongooseInstance);
  });

  it('reuses the cached connection across multiple calls without reconnecting', async () => {
    const mockMongooseInstance = {
      connection: { host: 'cluster0.mock.mongodb.net' },
    };

    const connectSpy = vi.spyOn(mongoose, 'connect').mockResolvedValue(mockMongooseInstance);

    // First call connects
    const conn1 = await connectDB();
    // Second and third calls reuse cached connection
    const conn2 = await connectDB();
    const conn3 = await connectDB();

    expect(connectSpy).toHaveBeenCalledTimes(1);
    expect(conn1).toBe(mockMongooseInstance);
    expect(conn2).toBe(mockMongooseInstance);
    expect(conn3).toBe(mockMongooseInstance);
  });

  it('resets cached promise on connection failure so subsequent retries can succeed', async () => {
    const connectSpy = vi
      .spyOn(mongoose, 'connect')
      .mockRejectedValueOnce(new Error('Connection timed out'))
      .mockResolvedValueOnce({
        connection: { host: 'recovered.mongodb.net' },
      });

    // First call fails
    await expect(connectDB()).rejects.toThrow('Connection timed out');
    expect(global.mongoose.promise).toBeNull();

    // Second call retries connection and succeeds
    const recoveredConn = await connectDB();
    expect(connectSpy).toHaveBeenCalledTimes(2);
    expect(recoveredConn.connection.host).toBe('recovered.mongodb.net');
  });
});
