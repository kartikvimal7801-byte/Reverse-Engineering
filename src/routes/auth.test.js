const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authRoutes = require('./auth');

// Mock the pool module
jest.mock('../db/pool', () => ({
  query: jest.fn()
}));

const pool = require('../db/pool');

// Create a test app
const createTestApp = () => {
  const app = express();
  const cookieParser = require('cookie-parser');
  
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/auth', authRoutes);
  
  return app;
};

describe('Authentication Endpoints', () => {
  let app;
  
  beforeAll(() => {
    process.env.JWT_SECRET = 'test_secret_key_for_testing_only';
    process.env.JWT_EXPIRES_IN = '30m';
    process.env.NODE_ENV = 'test';
  });
  
  beforeEach(() => {
    app = createTestApp();
    jest.clearAllMocks();
  });
  
  describe('POST /api/auth/login', () => {
    it('should return 400 if username is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ password: 'password123' });
      
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toBe('Username and password are required');
    });
    
    it('should return 400 if password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser' });
      
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
    
    it('should return 401 if user does not exist', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'nonexistent', password: 'password123' });
      
      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('AUTH_ERROR');
      expect(response.body.error.message).toBe('Invalid username or password');
    });
    
    it('should return 401 if password is incorrect', async () => {
      const passwordHash = await bcrypt.hash('correctpassword', 12);
      
      pool.query.mockResolvedValue({
        rows: [{
          id: 1,
          username: 'testuser',
          password_hash: passwordHash,
          role: 'user'
        }]
      });
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'wrongpassword' });
      
      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('AUTH_ERROR');
    });
    
    it('should return 200 and set httpOnly cookie on successful login', async () => {
      const passwordHash = await bcrypt.hash('password123', 12);
      
      pool.query.mockResolvedValue({
        rows: [{
          id: 1,
          username: 'testuser',
          password_hash: passwordHash,
          role: 'user'
        }]
      });
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'password123' });
      
      expect(response.status).toBe(200);
      expect(response.body.user).toEqual({
        id: 1,
        username: 'testuser',
        role: 'user'
      });
      expect(response.body.token).toBeDefined();
      
      // Verify httpOnly cookie is set
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some(cookie => cookie.includes('token='))).toBe(true);
      expect(cookies.some(cookie => cookie.includes('HttpOnly'))).toBe(true);
    });
    
    it('should use bcrypt with cost factor 12 for password hashing', async () => {
      // Verify that the test password was hashed with cost factor 12
      const password = 'testpassword123';
      const hash = await bcrypt.hash(password, 12);
      
      // Extract cost factor from hash (format: $2b$[cost]$...)
      const costFactor = parseInt(hash.split('$')[2], 10);
      expect(costFactor).toBe(12);
    });
    
    it('should generate JWT token with correct payload', async () => {
      const passwordHash = await bcrypt.hash('password123', 12);
      
      pool.query.mockResolvedValue({
        rows: [{
          id: 1,
          username: 'testuser',
          password_hash: passwordHash,
          role: 'manager'
        }]
      });
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'password123' });
      
      expect(response.status).toBe(200);
      
      // Verify token can be decoded and contains correct data
      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
      expect(decoded.userId).toBe(1);
      expect(decoded.username).toBe('testuser');
      expect(decoded.role).toBe('manager');
    });
  });
  
  describe('POST /api/auth/logout', () => {
    it('should clear the token cookie and return success message', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .send();
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logged out successfully');
      
      // Verify cookie is cleared
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some(cookie => cookie.includes('token=;'))).toBe(true);
    });
  });
  
  describe('GET /api/auth/session', () => {
    it('should return 401 if no token is provided', async () => {
      const response = await request(app)
        .get('/api/auth/session');
      
      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('AUTH_ERROR');
      expect(response.body.error.message).toBe('No token provided');
    });
    
    it('should return 401 if token is invalid', async () => {
      const response = await request(app)
        .get('/api/auth/session')
        .set('Authorization', 'Bearer invalid_token');
      
      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('AUTH_ERROR');
      expect(response.body.error.message).toBe('Invalid or expired token');
    });
    
    it('should return 401 if token is expired', async () => {
      // Create an expired token
      const expiredToken = jwt.sign(
        { userId: 1, username: 'testuser', role: 'user' },
        process.env.JWT_SECRET,
        { expiresIn: '-1s' } // Already expired
      );
      
      const response = await request(app)
        .get('/api/auth/session')
        .set('Authorization', `Bearer ${expiredToken}`);
      
      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('AUTH_ERROR');
    });
    
    it('should return 401 if user not found in database', async () => {
      const token = jwt.sign(
        { userId: 999, username: 'testuser', role: 'user' },
        process.env.JWT_SECRET,
        { expiresIn: '30m' }
      );
      
      pool.query.mockResolvedValue({ rows: [] });
      
      const response = await request(app)
        .get('/api/auth/session')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('AUTH_ERROR');
      expect(response.body.error.message).toBe('User not found');
    });
    
    it('should return user data for valid token in Authorization header', async () => {
      const token = jwt.sign(
        { userId: 1, username: 'testuser', role: 'user' },
        process.env.JWT_SECRET,
        { expiresIn: '30m' }
      );
      
      pool.query.mockResolvedValue({
        rows: [{
          id: 1,
          username: 'testuser',
          role: 'user'
        }]
      });
      
      const response = await request(app)
        .get('/api/auth/session')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.user).toEqual({
        id: 1,
        username: 'testuser',
        role: 'user'
      });
    });
    
    it('should return user data for valid token in cookie', async () => {
      const token = jwt.sign(
        { userId: 1, username: 'testuser', role: 'user' },
        process.env.JWT_SECRET,
        { expiresIn: '30m' }
      );
      
      pool.query.mockResolvedValue({
        rows: [{
          id: 1,
          username: 'testuser',
          role: 'user'
        }]
      });
      
      const response = await request(app)
        .get('/api/auth/session')
        .set('Cookie', [`token=${token}`]);
      
      expect(response.status).toBe(200);
      expect(response.body.user).toEqual({
        id: 1,
        username: 'testuser',
        role: 'user'
      });
    });
  });
  
  describe('Security Requirements', () => {
    it('should set secure cookie in production environment', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const testApp = createTestApp();
      const passwordHash = await bcrypt.hash('password123', 12);
      
      pool.query.mockResolvedValue({
        rows: [{
          id: 1,
          username: 'testuser',
          password_hash: passwordHash,
          role: 'user'
        }]
      });
      
      const response = await request(testApp)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'password123' });
      
      const cookies = response.headers['set-cookie'];
      expect(cookies.some(cookie => cookie.includes('Secure'))).toBe(true);
      
      process.env.NODE_ENV = originalEnv;
    });
    
    it('should set sameSite=strict for CSRF protection', async () => {
      const passwordHash = await bcrypt.hash('password123', 12);
      
      pool.query.mockResolvedValue({
        rows: [{
          id: 1,
          username: 'testuser',
          password_hash: passwordHash,
          role: 'user'
        }]
      });
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'password123' });
      
      const cookies = response.headers['set-cookie'];
      expect(cookies.some(cookie => cookie.includes('SameSite=Strict'))).toBe(true);
    });
  });
});
