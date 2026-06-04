const express = require('express');
const pool = require('../db/pool');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all projects (paginated)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM projects WHERE user_id = $1',
      [req.user.userId]
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT id, name, notes, status, current_step, created_at, updated_at
       FROM projects
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.userId, limit, offset]
    );

    res.json({
      projects: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      error: { code: 'SERVER_ERROR', message: 'Failed to retrieve projects' }
    });
  }
});

// Get single project
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Project not found' }
      });
    }

    res.json({ project: result.rows[0] });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      error: { code: 'SERVER_ERROR', message: 'Failed to retrieve project' }
    });
  }
});

// Create project
router.post('/', async (req, res) => {
  try {
    const { name, notes } = req.body;

    if (!name) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Project name is required' }
      });
    }

    const result = await pool.query(
      `INSERT INTO projects (user_id, name, notes, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING *`,
      [req.user.userId, name, notes || null]
    );

    res.status(201).json({ project: result.rows[0] });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      error: { code: 'SERVER_ERROR', message: 'Failed to create project' }
    });
  }
});

// Update project
router.put('/:id', async (req, res) => {
  try {
    const { name, notes } = req.body;

    // Check ownership
    const checkResult = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Project not found' }
      });
    }

    const result = await pool.query(
      `UPDATE projects
       SET name = COALESCE($1, name),
           notes = COALESCE($2, notes),
           updated_at = NOW()
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [name, notes, req.params.id, req.user.userId]
    );

    res.json({ project: result.rows[0] });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      error: { code: 'SERVER_ERROR', message: 'Failed to update project' }
    });
  }
});

// Delete project
router.delete('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check ownership
    const checkResult = await client.query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.userId]
    );

    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Project not found' }
      });
    }

    // Delete project (cascades to all related tables)
    await client.query('DELETE FROM projects WHERE id = $1', [req.params.id]);

    await client.query('COMMIT');
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Delete project error:', error);
    res.status(500).json({
      error: { code: 'SERVER_ERROR', message: 'Failed to delete project' }
    });
  } finally {
    client.release();
  }
});

module.exports = router;
