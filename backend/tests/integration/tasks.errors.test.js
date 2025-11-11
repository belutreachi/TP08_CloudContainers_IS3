const request = require('supertest');
const app = require('../../server');

function uniqueUser() {
  return `user_${Date.now()}_${Math.floor(Math.random() * 999)}`;
}

describe('Tasks Routes - Error Handling', () => {
  let token;
  let adminToken;
  let baseTaskId;

  beforeAll(async () => {
    // Create regular user
    const username = uniqueUser();
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ 
        username, 
        email: `${username}@mail.com`, 
        password: '123456' 
      });
    token = registerRes.body.token;

    // Login as admin
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'Admin123!' });
    adminToken = adminLogin.body.token;

    // Create a base test task
    const taskRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Base Test Task');
    baseTaskId = taskRes.body.id;
  });

  describe('PATCH /api/tasks/:id/complete', () => {
    test('❌ Cannot complete non-existent task', async () => {
      const res = await request(app)
        .patch('/api/tasks/999999/complete')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    test('❌ Cannot complete other user task', async () => {
      // Create a task with the first user
      const task1Res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .field('title', 'Task for Another User Complete Test');
      const task1Id = task1Res.body.id;

      // Create another user
      const username2 = uniqueUser();
      const registerRes2 = await request(app)
        .post('/api/auth/register')
        .send({ 
          username: username2, 
          email: `${username2}@mail.com`, 
          password: '123456' 
        });
      const token2 = registerRes2.body.token;

      const res = await request(app)
        .patch(`/api/tasks/${task1Id}/complete`)
        .set('Authorization', `Bearer ${token2}`);

      expect(res.status).toBe(403);
    });

    test('✅ User can complete their own task', async () => {
      // Create a fresh task for this test
      const taskRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .field('title', 'Task for Complete Own Test');
      const taskId = taskRes.body.id;

      const res = await request(app)
        .patch(`/api/tasks/${taskId}/complete`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('completed');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    test('❌ Cannot delete non-existent task', async () => {
      const res = await request(app)
        .delete('/api/tasks/999999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    test('❌ Cannot delete other user task', async () => {
      // Create a task with the first user
      const task1Res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .field('title', 'Task for Another User Delete Test');
      const task1Id = task1Res.body.id;

      // Create another user
      const username2 = uniqueUser();
      const registerRes2 = await request(app)
        .post('/api/auth/register')
        .send({ 
          username: username2, 
          email: `${username2}@mail.com`, 
          password: '123456' 
        });
      const token2 = registerRes2.body.token;

      const res = await request(app)
        .delete(`/api/tasks/${task1Id}`)
        .set('Authorization', `Bearer ${token2}`);

      expect(res.status).toBe(403);
    });

    test('✅ User can delete their own task', async () => {
      // Create a fresh task for this test
      const taskRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .field('title', 'Task for Delete Own Test');
      const taskId = taskRes.body.id;

      const res = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('deleted');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    test('❌ Cannot update non-existent task', async () => {
      const res = await request(app)
        .put('/api/tasks/999999')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated' });

      expect(res.status).toBe(404);
    });

    test('❌ Cannot update other user task', async () => {
      // Create a task with the first user
      const task1Res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .field('title', 'Task for Another User Update Test');
      const task1Id = task1Res.body.id;

      // Create another user
      const username2 = uniqueUser();
      const registerRes2 = await request(app)
        .post('/api/auth/register')
        .send({ 
          username: username2, 
          email: `${username2}@mail.com`, 
          password: '123456' 
        });
      const token2 = registerRes2.body.token;

      const res = await request(app)
        .put(`/api/tasks/${task1Id}`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ title: 'Updated' });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/tasks/all', () => {
    test('❌ Regular user cannot access all tasks', async () => {
      const res = await request(app)
        .get('/api/tasks/all')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    test('✅ Admin can access all tasks', async () => {
      const res = await request(app)
        .get('/api/tasks/all')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('Authentication required', () => {
    test('❌ GET /api/tasks without token', async () => {
      const res = await request(app).get('/api/tasks');
      expect(res.status).toBe(401);
    });

    test('❌ POST /api/tasks without token', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .field('title', 'Test');
      expect(res.status).toBe(401);
    });

    test('❌ PUT /api/tasks/:id without token', async () => {
      const res = await request(app)
        .put(`/api/tasks/${baseTaskId}`)
        .send({ title: 'Test' });
      expect(res.status).toBe(401);
    });

    test('❌ DELETE /api/tasks/:id without token', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${baseTaskId}`);
      expect(res.status).toBe(401);
    });

    test('❌ PATCH /api/tasks/:id/complete without token', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${baseTaskId}/complete`);
      expect(res.status).toBe(401);
    });

    test('❌ GET /api/tasks/stats without token', async () => {
      const res = await request(app).get('/api/tasks/stats');
      expect(res.status).toBe(401);
    });
  });
});
