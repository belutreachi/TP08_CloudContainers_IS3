const request = require('supertest');
const app = require('../../server');
const User = require('../../src/models/User');

function uniqueUser() {
  return `user_${Date.now()}_${Math.floor(Math.random() * 999)}`;
}

describe('Users Routes (Integration, Admin Only)', () => {
  let adminToken;
  let regularToken;
  let regularUserId;

  beforeAll(async () => {
    // Login as admin
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'Admin123!' });
    adminToken = adminLogin.body.token;

    // Create a regular user
    const username = uniqueUser();
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ 
        username, 
        email: `${username}@mail.com`, 
        password: '123456' 
      });
    
    regularToken = registerRes.body.token;
    regularUserId = registerRes.body.user.id;
  });

  describe('GET /api/users', () => {
    test('✅ Admin can get all users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    test('❌ Regular user cannot access', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${regularToken}`);

      expect(res.status).toBe(403);
    });

    test('❌ Unauthenticated request fails', async () => {
      const res = await request(app).get('/api/users');
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/users/:id', () => {
    test('✅ Admin can update user username', async () => {
      const newUsername = uniqueUser();
      const res = await request(app)
        .put(`/api/users/${regularUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ username: newUsername });

      expect(res.status).toBe(200);
      expect(res.body.user.username).toBe(newUsername);
    });

    test('✅ Admin can update user email', async () => {
      const newEmail = `${uniqueUser()}@test.com`;
      const res = await request(app)
        .put(`/api/users/${regularUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: newEmail });

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(newEmail);
    });

    test('✅ Admin can update user role', async () => {
      const res = await request(app)
        .put(`/api/users/${regularUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'admin' });

      expect(res.status).toBe(200);
      expect(res.body.user.role).toBe('admin');

      // Change back to user
      await request(app)
        .put(`/api/users/${regularUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'user' });
    });

    test('❌ Invalid user ID returns 400', async () => {
      const res = await request(app)
        .put('/api/users/invalid')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ username: 'test' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Identificador inválido');
    });

    test('❌ Empty username returns 400', async () => {
      const res = await request(app)
        .put(`/api/users/${regularUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ username: '   ' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('vacío');
    });

    test('❌ Empty email returns 400', async () => {
      const res = await request(app)
        .put(`/api/users/${regularUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: '   ' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('vacío');
    });

    test('❌ No data to update returns 400', async () => {
      const res = await request(app)
        .put(`/api/users/${regularUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('No se recibieron datos');
    });

    test('❌ Invalid role returns 400', async () => {
      const res = await request(app)
        .put(`/api/users/${regularUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'superadmin' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Rol inválido');
    });

    test('❌ Non-existent user returns 404', async () => {
      const res = await request(app)
        .put('/api/users/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ username: 'test' });

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('Usuario no encontrado');
    });

    test('❌ Duplicate username returns 400', async () => {
      const res = await request(app)
        .put(`/api/users/${regularUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ username: 'admin' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('nombre de usuario');
    });
  });

  describe('DELETE /api/users/:id', () => {
    test('✅ Admin can delete user', async () => {
      // Create a user to delete
      const username = uniqueUser();
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({ 
          username, 
          email: `${username}@mail.com`, 
          password: '123456' 
        });
      
      const userIdToDelete = registerRes.body.user.id;

      const res = await request(app)
        .delete(`/api/users/${userIdToDelete}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('eliminado');
    });

    test('❌ Invalid user ID returns 400', async () => {
      const res = await request(app)
        .delete('/api/users/invalid')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Identificador inválido');
    });

    test('❌ Cannot delete own account', async () => {
      // Get admin user ID
      const users = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);
      
      const adminUser = users.body.find(u => u.username === 'admin');

      const res = await request(app)
        .delete(`/api/users/${adminUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('propia cuenta');
    });

    test('❌ Non-existent user returns 404', async () => {
      const res = await request(app)
        .delete('/api/users/999999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('Usuario no encontrado');
    });

    test('❌ Regular user cannot delete', async () => {
      const res = await request(app)
        .delete(`/api/users/${regularUserId}`)
        .set('Authorization', `Bearer ${regularToken}`);

      expect(res.status).toBe(403);
    });
  });
});
