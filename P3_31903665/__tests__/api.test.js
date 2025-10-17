const request = require('supertest');
const app = require('../app');

describe('API endpoints', () => {
  describe('GET /about', () => {
    it('responds with JSend "success" and personal info', async () => {
      const res = await request(app)
        .get('/about')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body).toBeDefined();
      expect(res.body.status).toBe('success');
      expect(res.body.data).toMatchObject({
        nombreCompleto: 'Gabriel Andres Ochoa Padron',
        cedula: '31903665',
        seccion: '2'
      });
    });
  });

  describe('GET /ping', () => {
    it('responds 200 with empty body', async () => {
      const res = await request(app)
        .get('/ping')
        .expect(200);

      expect(res.text).toBe('');
    });
  });
});