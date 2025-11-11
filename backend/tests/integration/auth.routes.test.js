const request = require('supertest');
const app = require('../../server');

function uniqueUser() {
  return `user_${Date.now()}_${Math.floor(Math.random() * 999)}`;
}

describe('Auth Routes - Edge Cases and Validations', () => {
  describe('POST /api/auth/register', () => {
    test('✅ Successful registration', async () => {
      const username = uniqueUser();
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username,
          email: `${username}@test.com`,
          password: 'password123'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.username).toBe(username);
    });

    test('❌ Missing username', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@test.com',
          password: 'password123'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('required');
    });

    test('❌ Missing email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: uniqueUser(),
          password: 'password123'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('required');
    });

    test('❌ Missing password', async () => {
      const username = uniqueUser();
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username,
          email: `${username}@test.com`
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('required');
    });

    test('❌ Password too short', async () => {
      const username = uniqueUser();
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username,
          email: `${username}@test.com`,
          password: '12345'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('6 characters');
    });

    test('❌ Duplicate username', async () => {
      const username = uniqueUser();
      const email1 = `${username}@test.com`;
      const email2 = `${username}2@test.com`;

      // First registration
      await request(app)
        .post('/api/auth/register')
        .send({
          username,
          email: email1,
          password: 'password123'
        });

      // Try to register with same username
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username,
          email: email2,
          password: 'password123'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Username already exists');
    });

    test('❌ Duplicate email', async () => {
      const username1 = uniqueUser();
      const username2 = uniqueUser();
      const email = `${uniqueUser()}@test.com`;

      // First registration
      await request(app)
        .post('/api/auth/register')
        .send({
          username: username1,
          email,
          password: 'password123'
        });

      // Try to register with same email
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: username2,
          email,
          password: 'password123'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Email already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    const testUsername = uniqueUser();
    const testPassword = 'password123';

    beforeAll(async () => {
      // Create a test user
      await request(app)
        .post('/api/auth/register')
        .send({
          username: testUsername,
          email: `${testUsername}@test.com`,
          password: testPassword
        });
    });

    test('✅ Successful login', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUsername,
          password: testPassword
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.username).toBe(testUsername);
    });

    test('❌ Missing username', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          password: testPassword
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('required');
    });

    test('❌ Missing password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUsername
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('required');
    });

    test('❌ Non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistentuser123456',
          password: 'password123'
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Invalid credentials');
    });

    test('❌ Wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUsername,
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Invalid credentials');
    });
  });

  describe('Admin user login', () => {
    test('✅ Admin can login', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'Admin123!'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.role).toBe('admin');
    });
  });
});
