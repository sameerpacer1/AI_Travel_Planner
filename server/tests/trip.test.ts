import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('Trip CRUD & Authorization (IDOR Protection) Tests', () => {
  let userAToken: string;
  let userBToken: string;
  let userATripId: string;

  it('should set up User A and User B for authorization testing', async () => {
    const userA = {
      name: 'Alice Traveler',
      email: `alice_${Date.now()}@example.com`,
      password: 'Password123!',
    };
    const userB = {
      name: 'Bob Explorer',
      email: `bob_${Date.now()}@example.com`,
      password: 'Password123!',
    };

    const resA = await request(app).post('/api/auth/register').send(userA);
    const resB = await request(app).post('/api/auth/register').send(userB);

    userAToken = resA.body.data.token;
    userBToken = resB.body.data.token;

    expect(userAToken).toBeDefined();
    expect(userBToken).toBeDefined();
  }, 15000);

  it('should prevent unauthenticated trip creation (401)', async () => {
    const res = await request(app).post('/api/trips').send({
      origin: 'Ghaziabad',
      destination: 'Manali',
      startDate: '2026-10-10',
      endDate: '2026-10-13',
      travelers: 3,
      budget: 15000,
      interests: ['mountains', 'photography'],
    });

    expect(res.status).toBe(401);
  });

  it('should reject trip with invalid date range where endDate < startDate', async () => {
    const res = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        origin: 'Ghaziabad',
        destination: 'Manali',
        startDate: '2026-10-15',
        endDate: '2026-10-10', // Invalid: before start date
        travelers: 2,
        budget: 12000,
        interests: ['mountains'],
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should allow User A to create a valid trip', async () => {
    const res = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        origin: 'Ghaziabad',
        destination: 'Manali',
        startDate: '2026-10-10',
        endDate: '2026-10-13',
        travelers: 3,
        budget: 15000,
        travelStyle: 'budget',
        interests: ['mountains', 'photography', 'food'],
        transportPreference: 'bus',
        accommodationPreference: 'budget_hotel',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.trip.destination).toBe('Manali');
    expect(res.body.data.trip.travelers).toBe(3);
    userATripId = res.body.data.trip.id;
  });

  it('should allow User A to view their created trip', async () => {
    const res = await request(app)
      .get(`/api/trips/${userATripId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.trip.id).toBe(userATripId);
  });

  it('CRITICAL IDOR TEST: should prevent User B from accessing User A trip (404/Forbidden)', async () => {
    const res = await request(app)
      .get(`/api/trips/${userATripId}`)
      .set('Authorization', `Bearer ${userBToken}`);

    // Must be rejected - user B does not own user A's trip
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('CRITICAL IDOR TEST: should prevent User B from updating User A trip', async () => {
    const res = await request(app)
      .put(`/api/trips/${userATripId}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .send({ destination: 'Hacked City' });

    expect(res.status).toBe(404);
  });

  it('CRITICAL IDOR TEST: should prevent User B from deleting User A trip', async () => {
    const res = await request(app)
      .delete(`/api/trips/${userATripId}`)
      .set('Authorization', `Bearer ${userBToken}`);

    expect(res.status).toBe(404);
  });

  it('should allow User A to delete their own trip', async () => {
    const res = await request(app)
      .delete(`/api/trips/${userATripId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
