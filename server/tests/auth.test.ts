import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { AUTH_COOKIE_NAME } from '../src/services/auth/auth.service.js';

describe('Authentication Flow & Security Tests', () => {
  const testUser = {
    name: 'Travel Enthusiast',
    email: `traveler_${Date.now()}@example.com`,
    password: 'SecurePassword123!',
  };

  it('should register a new user successfully and set HttpOnly cookie', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.data.user.name).toBe(testUser.name);
    expect(res.body.data.user).not.toHaveProperty('passwordHash');

    // Verify Set-Cookie header exists and contains HttpOnly
    const cookies = res.headers['set-cookie'] as unknown as string[];
    expect(cookies).toBeDefined();
    expect(cookies.some((c) => c.includes(AUTH_COOKIE_NAME))).toBe(true);
    expect(cookies.some((c) => c.includes('HttpOnly'))).toBe(true);
  });

  it('should prevent registration with duplicate email (409 Conflict)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('should fail login with wrong password (401 Unauthorized)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword999!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should successfully log in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
  });

  it('should deny access to protected /api/auth/me without auth token', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should grant access to /api/auth/me with valid auth token in Bearer or Cookie', async () => {
    // Log in first to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    const token = loginRes.body.data.token;

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.data.user.email).toBe(testUser.email.toLowerCase());
  });
});
