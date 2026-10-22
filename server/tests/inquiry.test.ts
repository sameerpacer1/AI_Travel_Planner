import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('Inquiry Supabase Integration Tests', () => {
  it('should successfully submit an inquiry form and persist to Supabase', async () => {
    const payload = {
      name: 'Aarav Patel',
      email: 'aarav.patel@example.com',
      phone: '+91 98765 43210',
      destination: 'Kerala & Backwaters',
      travelDates: 'November 15 - November 22, 2026',
      travelersCount: '2 Adults, 1 Child',
      budget: '₹80,000 - ₹1,20,000',
      message: 'Looking for a serene houseboat stay in Alleppey and tea garden villa in Munnar.'
    };

    const res = await request(app)
      .post('/api/inquiries')
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.inquiry).toBeDefined();
    expect(res.body.data.inquiry.id).toBeDefined();
    expect(res.body.data.inquiry.name).toBe(payload.name);
    expect(res.body.data.inquiry.destination).toBe(payload.destination);
    expect(res.body.data.inquiry.status).toBe('pending');
  }, 15000);

  it('should list submitted inquiries from Supabase', async () => {
    const res = await request(app)
      .get('/api/inquiries');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.inquiries)).toBe(true);
    expect(res.body.data.inquiries.length).toBeGreaterThan(0);

    const found = res.body.data.inquiries.find((item: any) => item.email === 'aarav.patel@example.com');
    expect(found).toBeDefined();
    expect(found.destination).toBe('Kerala & Backwaters');
  });

  it('should reject invalid inquiry submissions (missing required fields)', async () => {
    const res = await request(app)
      .post('/api/inquiries')
      .send({
        name: 'Incomplete User'
        // missing email and message
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});
