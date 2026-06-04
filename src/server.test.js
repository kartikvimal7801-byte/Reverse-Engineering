const request = require('supertest');

// Mock the pool module before requiring server
jest.mock('./db/pool', () => ({
  query: jest.fn()
}));

describe('Server Integration', () => {
  let app;
  
  beforeEach(() => {
    // Clear module cache to get fresh app instance
    jest.clearAllMocks();
    delete require.cache[require.resolve('./server')];
    app = require('./server');
  });
  
  describe('Health Check', () => {
    it('should return 200 and status ok', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.timestamp).toBeDefined();
    });
  });
  
  describe('API Root', () => {
    it('should return 200 and welcome message', async () => {
      const response = await request(app).get('/api');
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('AI Reverse Engineering API');
    });
  });
  
  describe('Auth Routes Integration', () => {
    it('should mount auth routes at /api/auth', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'test', password: 'test' });
      
      // Should not return 404 (route not found)
      expect(response.status).not.toBe(404);
      
      // Will return 401 because no user exists in mock, but route is mounted
      expect([400, 401, 500]).toContain(response.status);
    });
  });
  
  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/unknown/route');
      
      expect(response.status).toBe(404);
      expect(response.body.error.message).toBe('Route not found');
    });
  });
  
  describe('CORS Configuration', () => {
    it('should have CORS enabled with credentials support', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3000');
      
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });
  });
});
