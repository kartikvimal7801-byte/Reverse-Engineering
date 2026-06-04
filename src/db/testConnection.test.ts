import testConnection from './testConnection';
import pool from './pool';

describe('Test Connection Utility', () => {
  afterAll(async () => {
    await pool.end();
  });

  test('should return true for successful connection', async () => {
    const result = await testConnection();
    expect(result).toBe(true);
  });

  test('should test database connectivity', async () => {
    // This test verifies the function can run without throwing
    await expect(testConnection()).resolves.toBeDefined();
  });
});
