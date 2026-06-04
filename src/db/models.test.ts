import pool from './pool';
import {
  User,
  Project,
  WorkflowStep,
  Component,
  Measurement,
  Material,
  PerformanceData,
  CostData,
  AIAnalysis,
  ManagementReview,
  Report,
  File,
} from './models';

describe('Database Models CRUD Operations', () => {
  let testUserId: number;
  let testProjectId: number;
  let testComponentId: number;

  beforeAll(async () => {
    // Ensure schema is set up
    const client = await pool.connect();
    try {
      // Clean up any test data from previous runs
      await client.query('DELETE FROM users WHERE username LIKE $1', ['test_%']);
    } finally {
      client.release();
    }
  });

  afterAll(async () => {
    // Clean up test data
    const client = await pool.connect();
    try {
      if (testUserId) {
        await client.query('DELETE FROM users WHERE id = $1', [testUserId]);
      }
    } finally {
      client.release();
      await pool.end();
    }
  });

  describe('Users Table', () => {
    test('should create a new user', async () => {
      const result = await pool.query(
        `INSERT INTO users (username, password_hash, role) 
         VALUES ($1, $2, $3) RETURNING *`,
        ['test_user_' + Date.now(), 'hashed_password', 'user']
      );
      expect(result.rows).toHaveLength(1);
      const user: User = result.rows[0];
      expect(user.id).toBeDefined();
      expect(user.username).toContain('test_user_');
      expect(user.role).toBe('user');
      testUserId = user.id;
    });

    test('should read user by id', async () => {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [testUserId]);
      expect(result.rows).toHaveLength(1);
      const user: User = result.rows[0];
      expect(user.id).toBe(testUserId);
    });

    test('should update user role', async () => {
      const result = await pool.query(
        `UPDATE users SET role = $1 WHERE id = $2 RETURNING *`,
        ['manager', testUserId]
      );
      expect(result.rows[0].role).toBe('manager');
    });

    test('should enforce unique username constraint', async () => {
      const username = 'test_unique_' + Date.now();
      await pool.query(
        `INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)`,
        [username, 'password', 'user']
      );
      await expect(
        pool.query(
          `INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)`,
          [username, 'password', 'user']
        )
      ).rejects.toThrow();
    });

    test('should enforce role constraint', async () => {
      await expect(
        pool.query(
          `INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)`,
          ['test_invalid_role', 'password', 'invalid_role']
        )
      ).rejects.toThrow();
    });
  });

  describe('Projects Table', () => {
    test('should create a new project', async () => {
      const result = await pool.query(
        `INSERT INTO projects (user_id, name, notes, status, current_step) 
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [testUserId, 'Test Project', 'Test notes', 'in_progress', 1]
      );
      expect(result.rows).toHaveLength(1);
      const project: Project = result.rows[0];
      expect(project.id).toBeDefined();
      expect(project.name).toBe('Test Project');
      expect(project.current_step).toBe(1);
      testProjectId = project.id;
    });

    test('should read project by id', async () => {
      const result = await pool.query('SELECT * FROM projects WHERE id = $1', [testProjectId]);
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].id).toBe(testProjectId);
    });

    test('should update project status', async () => {
      const result = await pool.query(
        `UPDATE projects SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        ['approved', testProjectId]
      );
      expect(result.rows[0].status).toBe('approved');
    });

    test('should enforce status constraint', async () => {
      await expect(
        pool.query(
          `UPDATE projects SET status = $1 WHERE id = $2`,
          ['invalid_status', testProjectId]
        )
      ).rejects.toThrow();
    });

    test('should enforce current_step constraint (1-11)', async () => {
      await expect(
        pool.query(
          `UPDATE projects SET current_step = $1 WHERE id = $2`,
          [12, testProjectId]
        )
      ).rejects.toThrow();
    });

    test('should cascade delete projects when user is deleted', async () => {
      // Create a temporary user and project
      const userResult = await pool.query(
        `INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id`,
        ['temp_user_' + Date.now(), 'password', 'user']
      );
      const tempUserId = userResult.rows[0].id;

      const projectResult = await pool.query(
        `INSERT INTO projects (user_id, name) VALUES ($1, $2) RETURNING id`,
        [tempUserId, 'Temp Project']
      );
      const tempProjectId = projectResult.rows[0].id;

      // Delete user
      await pool.query('DELETE FROM users WHERE id = $1', [tempUserId]);

      // Verify project was also deleted
      const result = await pool.query('SELECT * FROM projects WHERE id = $1', [tempProjectId]);
      expect(result.rows).toHaveLength(0);
    });
  });

  describe('Workflow Steps Table', () => {
    test('should create workflow steps', async () => {
      const result = await pool.query(
        `INSERT INTO workflow_steps (project_id, step_number, status, data) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [testProjectId, 1, 'incomplete', JSON.stringify({ test: 'data' })]
      );
      expect(result.rows).toHaveLength(1);
      const step: WorkflowStep = result.rows[0];
      expect(step.step_number).toBe(1);
      expect(step.data.test).toBe('data');
    });

    test('should enforce unique constraint on project_id + step_number', async () => {
      await expect(
        pool.query(
          `INSERT INTO workflow_steps (project_id, step_number) VALUES ($1, $2)`,
          [testProjectId, 1]
        )
      ).rejects.toThrow();
    });

    test('should update step status to complete', async () => {
      const result = await pool.query(
        `UPDATE workflow_steps SET status = $1, completed_at = NOW() 
         WHERE project_id = $2 AND step_number = $3 RETURNING *`,
        ['complete', testProjectId, 1]
      );
      expect(result.rows[0].status).toBe('complete');
      expect(result.rows[0].completed_at).toBeDefined();
    });

    test('should store JSONB data correctly', async () => {
      const testData = {
        productName: 'Test Pump',
        manufacturer: 'Test Corp',
        measurements: [1.23, 4.56, 7.89],
      };
      await pool.query(
        `UPDATE workflow_steps SET data = $1 WHERE project_id = $2 AND step_number = $3`,
        [JSON.stringify(testData), testProjectId, 1]
      );
      const result = await pool.query(
        `SELECT data FROM workflow_steps WHERE project_id = $1 AND step_number = $2`,
        [testProjectId, 1]
      );
      expect(result.rows[0].data).toEqual(testData);
    });
  });

  describe('Components Table', () => {
    test('should create a component', async () => {
      const result = await pool.query(
        `INSERT INTO components (project_id, part_id, photo_urls, assembly_position) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [testProjectId, 'PART-001', ['http://example.com/photo1.jpg'], 1]
      );
      expect(result.rows).toHaveLength(1);
      const component: Component = result.rows[0];
      expect(component.part_id).toBe('PART-001');
      expect(component.photo_urls).toHaveLength(1);
      testComponentId = component.id;
    });

    test('should handle array of photo URLs', async () => {
      const result = await pool.query(
        `SELECT photo_urls FROM components WHERE id = $1`,
        [testComponentId]
      );
      expect(Array.isArray(result.rows[0].photo_urls)).toBe(true);
    });
  });

  describe('Measurements Table', () => {
    test('should create a measurement', async () => {
      const result = await pool.query(
        `INSERT INTO measurements (component_id, measurement_type, value, unit, geometry_data) 
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [testComponentId, 'diameter', 25.456, 'mm', JSON.stringify({ shape: 'cylindrical' })]
      );
      expect(result.rows).toHaveLength(1);
      const measurement: Measurement = result.rows[0];
      expect(measurement.value).toBe(25.456);
      expect(measurement.geometry_data.shape).toBe('cylindrical');
    });

    test('should handle decimal precision (3 places)', async () => {
      await pool.query(
        `INSERT INTO measurements (component_id, value) VALUES ($1, $2)`,
        [testComponentId, 12.345]
      );
      const result = await pool.query(
        `SELECT value FROM measurements WHERE component_id = $1 ORDER BY id DESC LIMIT 1`,
        [testComponentId]
      );
      expect(result.rows[0].value).toBe(12.345);
    });
  });

  describe('Materials Table', () => {
    test('should create material records', async () => {
      const result = await pool.query(
        `INSERT INTO materials (component_id, material_type, material_name) 
         VALUES ($1, $2, $3) RETURNING *`,
        [testComponentId, 'casting', 'Cast Iron']
      );
      expect(result.rows).toHaveLength(1);
      const material: Material = result.rows[0];
      expect(material.material_name).toBe('Cast Iron');
    });
  });

  describe('Performance Data Table', () => {
    test('should create performance data', async () => {
      const result = await pool.query(
        `INSERT INTO performance_data (project_id, head, discharge, efficiency, power_consumption) 
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [testProjectId, 25.50, 1000.00, 85.75, 5000.00]
      );
      expect(result.rows).toHaveLength(1);
      const perfData: PerformanceData = result.rows[0];
      expect(perfData.head).toBe(25.50);
      expect(perfData.efficiency).toBe(85.75);
    });
  });

  describe('Cost Data Table', () => {
    test('should create cost data', async () => {
      const result = await pool.query(
        `INSERT INTO cost_data 
         (project_id, component_id, bom_cost, manufacturing_cost, assembly_cost, logistics_cost, total_cost) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [testProjectId, testComponentId, 100.50, 200.00, 50.00, 30.00, 380.50]
      );
      expect(result.rows).toHaveLength(1);
      const costData: CostData = result.rows[0];
      expect(costData.total_cost).toBe(380.50);
    });

    test('should handle decimal precision (2 places)', async () => {
      const result = await pool.query(
        `INSERT INTO cost_data (project_id, bom_cost) VALUES ($1, $2) RETURNING bom_cost`,
        [testProjectId, 123.45]
      );
      expect(result.rows[0].bom_cost).toBe(123.45);
    });
  });

  describe('AI Analysis Table', () => {
    test('should create AI analysis records', async () => {
      const result = await pool.query(
        `INSERT INTO ai_analysis 
         (project_id, step_number, analysis_type, input_data, output_data, status) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [
          testProjectId,
          7,
          'design_evaluation',
          JSON.stringify({ data: 'input' }),
          JSON.stringify({ improvements: [] }),
          'completed',
        ]
      );
      expect(result.rows).toHaveLength(1);
      const analysis: AIAnalysis = result.rows[0];
      expect(analysis.analysis_type).toBe('design_evaluation');
      expect(analysis.status).toBe('completed');
    });

    test('should enforce status constraint', async () => {
      await expect(
        pool.query(
          `INSERT INTO ai_analysis (project_id, step_number, status) VALUES ($1, $2, $3)`,
          [testProjectId, 8, 'invalid_status']
        )
      ).rejects.toThrow();
    });
  });

  describe('Management Reviews Table', () => {
    test('should create management review', async () => {
      const result = await pool.query(
        `INSERT INTO management_reviews (project_id, decision, feedback, reviewer_id) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [testProjectId, 'approved', 'Looks good', testUserId]
      );
      expect(result.rows).toHaveLength(1);
      const review: ManagementReview = result.rows[0];
      expect(review.decision).toBe('approved');
    });

    test('should enforce decision constraint', async () => {
      await expect(
        pool.query(
          `INSERT INTO management_reviews (project_id, decision) VALUES ($1, $2)`,
          [testProjectId, 'invalid_decision']
        )
      ).rejects.toThrow();
    });
  });

  describe('Reports Table', () => {
    test('should create report records', async () => {
      const result = await pool.query(
        `INSERT INTO reports (project_id, pdf_url) VALUES ($1, $2) RETURNING *`,
        [testProjectId, 'https://s3.example.com/reports/report1.pdf']
      );
      expect(result.rows).toHaveLength(1);
      const report: Report = result.rows[0];
      expect(report.pdf_url).toContain('report1.pdf');
    });
  });

  describe('Files Table', () => {
    test('should create file records', async () => {
      const result = await pool.query(
        `INSERT INTO files (project_id, file_name, file_type, file_size, s3_url) 
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [testProjectId, 'photo.jpg', 'image', 2048576, 'https://s3.example.com/photo.jpg']
      );
      expect(result.rows).toHaveLength(1);
      const file: File = result.rows[0];
      expect(file.file_name).toBe('photo.jpg');
      expect(file.file_size).toBe(2048576);
    });
  });

  describe('Foreign Key Constraints', () => {
    test('should enforce foreign key on components.project_id', async () => {
      await expect(
        pool.query(
          `INSERT INTO components (project_id, part_id) VALUES ($1, $2)`,
          [99999, 'INVALID']
        )
      ).rejects.toThrow();
    });

    test('should enforce foreign key on measurements.component_id', async () => {
      await expect(
        pool.query(
          `INSERT INTO measurements (component_id, value) VALUES ($1, $2)`,
          [99999, 10.5]
        )
      ).rejects.toThrow();
    });

    test('should cascade delete components when project is deleted', async () => {
      // Create temporary project and component
      const projResult = await pool.query(
        `INSERT INTO projects (user_id, name) VALUES ($1, $2) RETURNING id`,
        [testUserId, 'Temp Project']
      );
      const tempProjId = projResult.rows[0].id;

      const compResult = await pool.query(
        `INSERT INTO components (project_id, part_id) VALUES ($1, $2) RETURNING id`,
        [tempProjId, 'TEMP-001']
      );
      const tempCompId = compResult.rows[0].id;

      // Delete project
      await pool.query('DELETE FROM projects WHERE id = $1', [tempProjId]);

      // Verify component was also deleted
      const result = await pool.query('SELECT * FROM components WHERE id = $1', [tempCompId]);
      expect(result.rows).toHaveLength(0);
    });
  });
});
