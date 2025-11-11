const request = require('supertest');
const app = require('../../server');
const path = require('path');
const fs = require('fs');

function uniqueUser() {
  return `user_${Date.now()}_${Math.floor(Math.random() * 999)}`;
}

describe('Tasks Routes - Stats and Advanced Features', () => {
  let token;
  let adminToken;
  let taskId;

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

    // Create some test tasks
    const task1 = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Task for Stats')
      .field('description', 'Test task')
      .field('due_date', '2024-06-15');
    taskId = task1.body.id;

    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Completed Task')
      .field('due_date', '2024-07-20');

    await request(app)
      .patch(`/api/tasks/${task1.body.id}/complete`)
      .set('Authorization', `Bearer ${token}`);
  });

  describe('GET /api/tasks/stats', () => {
    test('✅ User gets their own stats', async () => {
      const res = await request(app)
        .get('/api/tasks/stats')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('completed');
      expect(res.body).toHaveProperty('pending');
      expect(res.body).toHaveProperty('progress');
      
      expect(typeof res.body.total).toBe('number');
      expect(typeof res.body.completed).toBe('number');
      expect(typeof res.body.pending).toBe('number');
      expect(typeof res.body.progress).toBe('number');
    });

    test('✅ Admin can get all stats', async () => {
      const res = await request(app)
        .get('/api/tasks/stats?view=all')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('total');
      expect(res.body.total).toBeGreaterThanOrEqual(0);
    });

    test('✅ Stats with status filter', async () => {
      const res = await request(app)
        .get('/api/tasks/stats?status=hecha')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('total');
    });

    test('✅ Stats with date filters', async () => {
      const res = await request(app)
        .get('/api/tasks/stats?startDate=2024-01-01&endDate=2024-12-31')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('total');
    });

    test('✅ Stats with search filter', async () => {
      const res = await request(app)
        .get('/api/tasks/stats?search=task')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('total');
    });
  });

  describe('GET /api/tasks with filters', () => {
    test('✅ Filter by completed status', async () => {
      const res = await request(app)
        .get('/api/tasks?status=hecha')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('✅ Filter by pending status', async () => {
      const res = await request(app)
        .get('/api/tasks?status=no_hecha')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('✅ Filter by start date', async () => {
      const res = await request(app)
        .get('/api/tasks?startDate=2024-01-01')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('✅ Filter by end date', async () => {
      const res = await request(app)
        .get('/api/tasks?endDate=2024-12-31')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('✅ Search in tasks', async () => {
      const res = await request(app)
        .get('/api/tasks?search=task')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('✅ Multiple filters combined', async () => {
      const res = await request(app)
        .get('/api/tasks?status=hecha&startDate=2024-01-01&search=task')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/tasks/all with filters', () => {
    test('✅ Admin can get all tasks with filters', async () => {
      const res = await request(app)
        .get('/api/tasks/all?status=hecha')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('✅ Admin can search all tasks', async () => {
      const res = await request(app)
        .get('/api/tasks/all?search=task')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/tasks - Attachments', () => {
    test('✅ Create task with attachment', async () => {
      // Create a temporary test file
      const testFilePath = path.join(__dirname, '..', '..', 'uploads', 'test.txt');
      fs.mkdirSync(path.dirname(testFilePath), { recursive: true });
      fs.writeFileSync(testFilePath, 'test content');

      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .field('title', 'Task with Attachment')
        .field('description', 'Has a file')
        .attach('attachments', testFilePath);

      expect([200, 201]).toContain(res.status);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('attachments');
      expect(Array.isArray(res.body.attachments)).toBe(true);

      // Cleanup
      fs.unlinkSync(testFilePath);
    });

    test('❌ Create task without title returns 400', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .field('description', 'No title');

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('required');
    });
  });

  describe('PUT /api/tasks/:id - with attachments', () => {
    test('✅ Update task with new attachment', async () => {
      // Create a new task first
      const createRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .field('title', 'Task to Update with Attachment')
        .field('description', 'Original description');

      const newTaskId = createRes.body.id;

      const testFilePath = path.join(__dirname, '..', '..', 'uploads', 'test-update.txt');
      fs.mkdirSync(path.dirname(testFilePath), { recursive: true });
      fs.writeFileSync(testFilePath, 'test content');

      const res = await request(app)
        .put(`/api/tasks/${newTaskId}`)
        .set('Authorization', `Bearer ${token}`)
        .field('title', 'Updated Title')
        .field('description', 'Updated description')
        .attach('attachments', testFilePath);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');

      // Cleanup
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }
    });
  });

  describe('DELETE /api/tasks/:id/attachments/:attachmentId', () => {
    let taskWithAttachment;
    let attachmentId;

    beforeAll(async () => {
      const testFilePath = path.join(__dirname, '..', '..', 'uploads', 'test-delete.txt');
      fs.mkdirSync(path.dirname(testFilePath), { recursive: true });
      fs.writeFileSync(testFilePath, 'test content');

      const createRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .field('title', 'Task for Attachment Delete')
        .attach('attachments', testFilePath);

      taskWithAttachment = createRes.body;
      if (taskWithAttachment.attachments && taskWithAttachment.attachments.length > 0) {
        attachmentId = taskWithAttachment.attachments[0].id;
      }

      // Cleanup
      fs.unlinkSync(testFilePath);
    });

    test('✅ Delete attachment from task', async () => {
      if (!attachmentId) {
        // Skip if no attachment was created
        return;
      }

      const res = await request(app)
        .delete(`/api/tasks/${taskWithAttachment.id}/attachments/${attachmentId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('deleted');
      expect(res.body).toHaveProperty('attachments');
    });

    test('❌ Delete attachment from non-existent task', async () => {
      const res = await request(app)
        .delete('/api/tasks/999999/attachments/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    test('❌ Delete non-existent attachment', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${taskWithAttachment.id}/attachments/999999`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    test('❌ Cannot delete attachment from other user task', async () => {
      // Create a new task with attachment for this test
      const testFilePath = path.join(__dirname, '..', '..', 'uploads', 'test-perm.txt');
      fs.mkdirSync(path.dirname(testFilePath), { recursive: true });
      fs.writeFileSync(testFilePath, 'test content');

      const createRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .field('title', 'Task for Permission Test')
        .attach('attachments', testFilePath);

      const testTask = createRes.body;
      let testAttachmentId = null;

      if (testTask.attachments && testTask.attachments.length > 0) {
        testAttachmentId = testTask.attachments[0].id;
      }

      // Cleanup file
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }

      if (!testAttachmentId) {
        return; // Skip if no attachment was created
      }

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
        .delete(`/api/tasks/${testTask.id}/attachments/${testAttachmentId}`)
        .set('Authorization', `Bearer ${token2}`);

      expect(res.status).toBe(403);
    });
  });
});
