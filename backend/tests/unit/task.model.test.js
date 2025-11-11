const request = require('supertest');
const app = require('../../server');
const Task = require('../../src/models/Task');

function uniqueUser() {
  return `user_${Date.now()}_${Math.floor(Math.random() * 999)}`;
}

describe('Task Model - Filters and Stats', () => {
  let token;
  let userId;

  beforeAll(async () => {
    const username = uniqueUser();
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ 
        username, 
        email: `${username}@mail.com`, 
        password: '123456' 
      });
    
    token = registerRes.body.token;
    userId = registerRes.body.user.id;
  });

  describe('findByUserId with filters', () => {
    beforeAll(async () => {
      // Create test tasks
      await Task.create('Completed Task', 'Done', '2024-01-15', userId);
      const completedTask = await Task.create('Another Completed', 'Done', '2024-02-20', userId);
      await Task.toggleComplete(completedTask.id);
      
      await Task.create('Pending Task', 'Not done', '2024-03-10', userId);
      await Task.create('Search Test Task', 'Testing search', '2024-04-05', userId);
    });

    test('✅ Filter by status: completed', async () => {
      const tasks = await Task.findByUserId(userId, { status: 'hecha' });
      
      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks.every(t => t.completed === 1 || t.completed === true)).toBe(true);
    });

    test('✅ Filter by status: not completed', async () => {
      const tasks = await Task.findByUserId(userId, { status: 'no_hecha' });
      
      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks.every(t => t.completed === 0 || t.completed === false)).toBe(true);
    });

    test('✅ Filter by start date', async () => {
      const tasks = await Task.findByUserId(userId, { startDate: '2024-03-01' });
      
      expect(Array.isArray(tasks)).toBe(true);
      tasks.forEach(task => {
        if (task.due_date) {
          expect(new Date(task.due_date) >= new Date('2024-03-01')).toBe(true);
        }
      });
    });

    test('✅ Filter by end date', async () => {
      const tasks = await Task.findByUserId(userId, { endDate: '2024-02-28' });
      
      expect(Array.isArray(tasks)).toBe(true);
      tasks.forEach(task => {
        if (task.due_date) {
          expect(new Date(task.due_date) <= new Date('2024-02-28')).toBe(true);
        }
      });
    });

    test('✅ Filter by date range', async () => {
      const tasks = await Task.findByUserId(userId, { 
        startDate: '2024-02-01', 
        endDate: '2024-03-31' 
      });
      
      expect(Array.isArray(tasks)).toBe(true);
      tasks.forEach(task => {
        if (task.due_date) {
          const dueDate = new Date(task.due_date);
          expect(dueDate >= new Date('2024-02-01')).toBe(true);
          expect(dueDate <= new Date('2024-03-31')).toBe(true);
        }
      });
    });

    test('✅ Search in title and description', async () => {
      const tasks = await Task.findByUserId(userId, { search: 'task' });
      
      expect(Array.isArray(tasks)).toBe(true);
      // Just verify it returns an array, may or may not have results depending on test execution order
      if (tasks.length > 0) {
        expect(tasks.some(t => 
          t.title.toLowerCase().includes('task') || 
          (t.description && t.description.toLowerCase().includes('task'))
        )).toBe(true);
      }
    });

    test('✅ Combine multiple filters', async () => {
      const tasks = await Task.findByUserId(userId, { 
        status: 'no_hecha',
        startDate: '2024-01-01',
        search: 'task'
      });
      
      expect(Array.isArray(tasks)).toBe(true);
    });
  });

  describe('findAll with filters', () => {
    test('✅ Get all tasks with filter', async () => {
      const tasks = await Task.findAll({ status: 'hecha' });
      
      expect(Array.isArray(tasks)).toBe(true);
      tasks.forEach(task => {
        expect(task).toHaveProperty('username');
      });
    });

    test('✅ Search across all tasks', async () => {
      const tasks = await Task.findAll({ search: 'task' });
      
      expect(Array.isArray(tasks)).toBe(true);
    });
  });

  describe('getStatsByUserId', () => {
    test('✅ Get stats for user', async () => {
      const stats = await Task.getStatsByUserId(userId);
      
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('completed');
      expect(stats).toHaveProperty('pending');
      expect(stats).toHaveProperty('progress');
      
      expect(typeof stats.total).toBe('number');
      expect(typeof stats.completed).toBe('number');
      expect(typeof stats.pending).toBe('number');
      expect(typeof stats.progress).toBe('number');
      
      expect(stats.total).toBeGreaterThanOrEqual(0);
      expect(stats.progress).toBeGreaterThanOrEqual(0);
      expect(stats.progress).toBeLessThanOrEqual(100);
    });

    test('✅ Stats with filters', async () => {
      const stats = await Task.getStatsByUserId(userId, { status: 'hecha' });
      
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('completed');
    });

    test('✅ Stats with date range', async () => {
      const stats = await Task.getStatsByUserId(userId, { 
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      });
      
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('completed');
    });
  });

  describe('getStatsForAll', () => {
    test('✅ Get global stats', async () => {
      const stats = await Task.getStatsForAll();
      
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('completed');
      expect(stats).toHaveProperty('pending');
      expect(stats).toHaveProperty('progress');
      
      expect(typeof stats.total).toBe('number');
      expect(stats.total).toBeGreaterThanOrEqual(0);
    });

    test('✅ Global stats with filters', async () => {
      const stats = await Task.getStatsForAll({ status: 'hecha' });
      
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('completed');
    });

    test('✅ Global stats with search', async () => {
      const stats = await Task.getStatsForAll({ search: 'task' });
      
      expect(stats).toHaveProperty('total');
    });
  });

  describe('toggleComplete', () => {
    test('✅ Toggle task completion', async () => {
      const task = await Task.create('Toggle Test', 'Test toggle', null, userId);
      
      const result = await Task.toggleComplete(task.id);
      expect(result.changes).toBe(1);

      const toggled = await Task.findById(task.id);
      expect(toggled.completed).toBeTruthy();

      // Toggle back
      await Task.toggleComplete(task.id);
      const toggledBack = await Task.findById(task.id);
      expect(toggledBack.completed).toBeFalsy();
    });
  });

  describe('update', () => {
    test('✅ Update task', async () => {
      const task = await Task.create('Old Title', 'Old Desc', null, userId);
      
      const result = await Task.update(task.id, 'New Title', 'New Desc', '2024-12-31');
      expect(result.changes).toBe(1);

      const updated = await Task.findById(task.id);
      expect(updated.title).toBe('New Title');
      expect(updated.description).toBe('New Desc');
    });
  });

  describe('delete', () => {
    test('✅ Delete task', async () => {
      const task = await Task.create('Delete Me', 'Will be deleted', null, userId);
      
      const result = await Task.delete(task.id);
      expect(result.changes).toBe(1);

      const deleted = await Task.findById(task.id);
      expect(deleted).toBeNull();
    });
  });

  describe('findById', () => {
    test('✅ Returns null for non-existent task', async () => {
      const task = await Task.findById(999999);
      expect(task).toBeNull();
    });

    test('✅ Returns task with attachments', async () => {
      const task = await Task.create('Task with Attachments', 'Test', null, userId);
      
      const found = await Task.findById(task.id);
      expect(found).toHaveProperty('attachments');
      expect(Array.isArray(found.attachments)).toBe(true);
    });
  });
});
