import pool from './pool';

async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    console.log('✓ Database connection successful');
    
    // Test query
    const result = await client.query('SELECT NOW()');
    console.log('✓ Test query successful:', result.rows[0]);
    
    client.release();
    return true;
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    return false;
  }
}

if (require.main === module) {
  testConnection()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Connection test error:', error);
      process.exit(1);
    });
}

export default testConnection;
