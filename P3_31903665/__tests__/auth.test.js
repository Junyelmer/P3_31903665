require('dotenv').config(); // Carga las variables de entorno
var express = require('express');
const request = require('supertest');
const app = require('../app');
const db = require('../models');

beforeAll(async () => {
  await db.sequelize.sync({ force: true });
});

afterAll(async () => {
  await db.sequelize.close();
});

describe('Autenticacion y Autorizacion', () => {

    beforeEach(async () => {
        await db.User.destroy({ where: {}, truncate: true });
    });

    it('Deberia registrar un nuevo usuario con exito', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({
                nombreCompleto: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.status).toBe('success');
        expect(res.body.data.user).toHaveProperty('email', 'test@example.com');
        expect(res.body.data).toHaveProperty('token');
        expect(res.body.data.user).not.toHaveProperty('password');
    });

    it('Deberia permitir login con credenciales correctas', async () => {
        await request(app)
            .post('/auth/register')
            .send({ nombreCompleto: 'Login User', email: 'login@test.com', password: 'secretpassword' });

        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'login@test.com', password: 'secretpassword' });
            
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('token');
    });

    it('Deberia denegar el acceso a /users sin un token', async () => {
        const res = await request(app).get('/users');
        expect(res.statusCode).toEqual(401);
        expect(res.body.status).toBe('error');
    });
    
    it('Deberia permitir el acceso a /users con un token valido', async () => {
        const authRes = await request(app)
            .post('/auth/register')
            .send({ nombreCompleto: 'Auth User', email: 'auth@test.com', password: 'securepass' });
        const token = authRes.body.data.token;

        const res = await request(app)
            .get('/users')
            .set('Authorization', `Bearer ${token}`);
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe('success');
    });

});