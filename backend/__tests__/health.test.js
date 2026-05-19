const request = require('supertest');
const app = require('../server').app;

describe('Health Check', () => {
  test('should return 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
