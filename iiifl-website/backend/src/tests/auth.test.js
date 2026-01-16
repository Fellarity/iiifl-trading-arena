const request = require('supertest');
const app = require('../app');
const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Mock db.query and db.getClient
jest.mock('../config/db', () => {
  const mClient = {
    query: jest.fn(),
    release: jest.fn(),
  };
  return {
    query: jest.fn(),
    getClient: jest.fn(() => mClient),
  };
});

describe('Auth Endpoints', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should register a new user', async () => {
    const mClient = db.getClient();
    // 1. Mock "BEGIN"
    mClient.query.mockResolvedValueOnce({});
    // 2. Mock check user exists (empty array = no user)
    mClient.query.mockResolvedValueOnce({ rows: [] }); 
    // 3. Mock hash (bcrypt is real, but we mock the salt/hash if we want, but let's run real bcrypt)
    // 4. Mock role select
    mClient.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });
    // 5. Mock Insert User
    mClient.query.mockResolvedValueOnce({ 
        rows: [{ id: 'user-uuid', email: 'test@test.com', full_name: 'Test User' }] 
    });
    // 6. Mock Insert Wallet
    mClient.query.mockResolvedValueOnce({});
    // 7. Mock "COMMIT"
    mClient.query.mockResolvedValueOnce({});

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@test.com',
        password: 'password123',
        full_name: 'Test User',
        phone_number: '1234567890'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.data.user.email).toBe('test@test.com');
  });

  it('should fail if email already exists', async () => {
    const mClient = db.getClient();
    mClient.query.mockResolvedValueOnce({}); // BEGIN
    // Check user exists (returns row)
    mClient.query.mockResolvedValueOnce({ rows: [{ id: 'existing-id' }] });
    mClient.query.mockResolvedValueOnce({}); // ROLLBACK

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'exists@test.com',
        password: 'password123',
        full_name: 'Test User',
        phone_number: '1234567890'
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe('Email already registered');
  });
});
