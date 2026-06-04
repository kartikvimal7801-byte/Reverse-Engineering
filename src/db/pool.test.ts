import pool from './pool';
import { Pool } from 'pg';

describe('Database Connection Pool', () => {
  afterAll(async () => {
    await pool.end();
  });

  test('should create a pool instance', () => {
    expect(pool).toBeInstanceOf(Pool);
  });

  test('should connect to database successfully', async () => {
    const client = await pool.connect();
    expect(client).toBeDefined();
    client.release();
  });

  test('should execute a simple query', async () => {
    const result = await pool.query('SELECT 1 as num');
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].num).toBe(1);
  });

  test('should handle multiple concurrent connections', async () => {
    const promises = Array.from({ length: 5 }, () =>
      pool.query('SELECT NOW()')
    );
    const results = await Promise.all(promises);
    expect(results).toHaveLength(5);
    results.forEach((result) => {
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].now).toBeDefined();
    });
  });

  test('should handle query errors gracefully', async () => {
    await expect(pool.query('INVALID SQL QUERY')).rejects.toThrow();
  });

  test('should release client back to pool', async () => {
    const client = await pool.connect();
    const clientId = (client as any).processID;
    client.release();

    // Connect again and verify we can get a client
    const client2 = await pool.connect();
    expect(client2).toBeDefined();
    client2.release();
  });
});
