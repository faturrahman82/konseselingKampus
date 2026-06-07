const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

process.env.VERCEL = '1';
process.env.NODE_ENV = 'test';
process.env.CORS_ORIGINS = 'http://localhost:5173';

const app = require('../index');

test('health endpoint returns a stable response', async () => {
    const response = await request(app).get('/api').expect(200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.message, 'UniCounsel API is running');
});

test('unknown API route uses the standardized error shape', async () => {
    const response = await request(app).get('/api/not-found').expect(404);
    assert.equal(response.body.success, false);
    assert.equal(typeof response.body.message, 'string');
});

test('protected route rejects a missing token consistently', async () => {
    const response = await request(app).get('/api/chat/inbox').expect(401);
    assert.deepEqual(response.body, {
        success: false,
        message: 'Access denied. No token provided.',
    });
});

test('CORS accepts configured frontend origin', async () => {
    const response = await request(app)
        .options('/api')
        .set('Origin', 'http://localhost:5173')
        .set('Access-Control-Request-Method', 'GET')
        .expect(204);
    assert.equal(response.headers['access-control-allow-origin'], 'http://localhost:5173');
});

test('CORS rejects an unknown origin', async () => {
    const response = await request(app)
        .get('/api')
        .set('Origin', 'https://untrusted.example')
        .expect(403);
    assert.equal(response.body.success, false);
    assert.equal(response.body.message, 'Origin tidak diizinkan oleh CORS.');
});
