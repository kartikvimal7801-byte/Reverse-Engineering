import pool from './pool';
import migrate from './migrate';

describe('Database Migration', () => {
  afterAll(async () => {
    await pool.end();
  });

  test('should run migration successfully', async () => {
    await expect(migrate()).resolves.not.toThrow();
  });

  test('should create all required tables', async () => {
    const tables = [
      'users',
      'projects',
      'workflow_steps',
      'components',
      'measurements',
      'materials',
      'performance_data',
      'cost_data',
      'ai_analysis',
      'management_reviews',
      'reports',
      'files',
    ];

    for (const table of tables) {
      const result = await pool.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )`,
        [table]
      );
      expect(result.rows[0].exists).toBe(true);
    }
  });

  test('should create indexes', async () => {
    const indexes = [
      'idx_projects_user_id',
      'idx_workflow_steps_project_id',
      'idx_components_project_id',
      'idx_files_project_id',
    ];

    for (const indexName of indexes) {
      const result = await pool.query(
        `SELECT EXISTS (
          SELECT FROM pg_indexes 
          WHERE schemaname = 'public' 
          AND indexname = $1
        )`,
        [indexName]
      );
      expect(result.rows[0].exists).toBe(true);
    }
  });

  test('should be idempotent (can run multiple times)', async () => {
    // Run migration again
    await expect(migrate()).resolves.not.toThrow();

    // Verify tables still exist
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM information_schema.tables 
       WHERE table_schema = 'public' 
       AND table_name IN ('users', 'projects', 'workflow_steps')`
    );
    expect(parseInt(result.rows[0].count)).toBeGreaterThanOrEqual(3);
  });

  test('should set correct data types for columns', async () => {
    // Check users table columns
    const usersColumns = await pool.query(
      `SELECT column_name, data_type, character_maximum_length 
       FROM information_schema.columns 
       WHERE table_name = 'users' AND table_schema = 'public'`
    );

    const usernameCol = usersColumns.rows.find((col) => col.column_name === 'username');
    expect(usernameCol?.data_type).toBe('character varying');
    expect(usernameCol?.character_maximum_length).toBe(255);

    // Check projects table columns
    const projectsColumns = await pool.query(
      `SELECT column_name, data_type 
       FROM information_schema.columns 
       WHERE table_name = 'projects' AND table_schema = 'public'`
    );

    const statusCol = projectsColumns.rows.find((col) => col.column_name === 'status');
    expect(statusCol?.data_type).toBe('character varying');

    // Check workflow_steps has JSONB data column
    const stepsColumns = await pool.query(
      `SELECT column_name, data_type 
       FROM information_schema.columns 
       WHERE table_name = 'workflow_steps' AND column_name = 'data'`
    );
    expect(stepsColumns.rows[0]?.data_type).toBe('jsonb');
  });
});
