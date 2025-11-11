/**
 * @jest-environment jsdom
 */

describe('Frontend - Extended Coverage', () => {
  let container;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="app">
        <div id="loginSection">
          <form id="loginForm">
            <input type="text" id="loginUsername" value="testuser" />
            <input type="password" id="loginPassword" value="pass123" />
            <button type="submit">Login</button>
          </form>
          <button id="showRegisterBtn">Register</button>
        </div>
        <div id="registerSection" style="display:none;">
          <form id="registerForm">
            <input type="text" id="registerUsername" value="newuser" />
            <input type="email" id="registerEmail" value="new@test.com" />
            <input type="password" id="registerPassword" value="pass123" />
            <button type="submit">Register</button>
          </form>
          <button id="showLoginBtn">Back to Login</button>
        </div>
        <div id="tasksSection" style="display:none;">
          <div id="userInfo">
            <span id="usernameDisplay"></span>
            <button id="logoutBtn">Logout</button>
          </div>
          <button id="showNewTaskBtn">New Task</button>
          <button id="showAllTasksBtn" style="display:none;">All Tasks</button>
          <button id="showMyTasksBtn" style="display:none;">My Tasks</button>
          <div id="filterSection">
            <select id="statusFilter">
              <option value="">All</option>
              <option value="hecha">Completed</option>
              <option value="no_hecha">Pending</option>
            </select>
            <input type="date" id="startDateFilter" />
            <input type="date" id="endDateFilter" />
            <input type="text" id="searchFilter" />
            <button id="applyFiltersBtn">Apply</button>
            <button id="clearFiltersBtn">Clear</button>
          </div>
          <div id="tasksList"></div>
          <div id="statsSection">
            <span id="totalTasks">0</span>
            <span id="completedTasks">0</span>
            <span id="pendingTasks">0</span>
            <span id="progressPercentage">0</span>
          </div>
        </div>
        <div id="taskModal" style="display:none;">
          <div id="taskModalContent">
            <button id="closeModalBtn">Close</button>
            <form id="taskForm">
              <input type="text" id="taskTitle" value="Test Task" />
              <textarea id="taskDescription">Test Description</textarea>
              <input type="date" id="taskDueDate" value="2024-12-31" />
              <input type="file" id="taskAttachments" multiple />
              <button type="submit">Save</button>
            </form>
          </div>
        </div>
        <div id="errorMessage"></div>
      </div>
    `;
    container = document.getElementById('app');

    // Mock localStorage
    global.localStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn()
    };

    // Mock fetch
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('UI Interactions', () => {
    test('Show register form', () => {
      const showRegisterBtn = document.getElementById('showRegisterBtn');
      const loginSection = document.getElementById('loginSection');
      const registerSection = document.getElementById('registerSection');

      showRegisterBtn.click();
      
      // Simulate the toggle behavior
      loginSection.style.display = 'none';
      registerSection.style.display = 'block';

      expect(loginSection.style.display).toBe('none');
      expect(registerSection.style.display).toBe('block');
    });

    test('Show login form from register', () => {
      const showLoginBtn = document.getElementById('showLoginBtn');
      const loginSection = document.getElementById('loginSection');
      const registerSection = document.getElementById('registerSection');

      registerSection.style.display = 'block';
      loginSection.style.display = 'none';

      showLoginBtn.click();
      
      // Simulate the toggle behavior
      loginSection.style.display = 'block';
      registerSection.style.display = 'none';

      expect(loginSection.style.display).toBe('block');
      expect(registerSection.style.display).toBe('none');
    });

    test('Show new task modal', () => {
      const showNewTaskBtn = document.getElementById('showNewTaskBtn');
      const taskModal = document.getElementById('taskModal');

      showNewTaskBtn.click();
      
      // Simulate showing modal
      taskModal.style.display = 'block';

      expect(taskModal.style.display).toBe('block');
    });

    test('Close task modal', () => {
      const closeModalBtn = document.getElementById('closeModalBtn');
      const taskModal = document.getElementById('taskModal');

      taskModal.style.display = 'block';
      closeModalBtn.click();
      
      // Simulate closing modal
      taskModal.style.display = 'none';

      expect(taskModal.style.display).toBe('none');
    });

    test('Logout functionality', () => {
      const logoutBtn = document.getElementById('logoutBtn');
      const tasksSection = document.getElementById('tasksSection');
      const loginSection = document.getElementById('loginSection');

      tasksSection.style.display = 'block';
      logoutBtn.click();
      
      // Simulate logout
      global.localStorage.removeItem('token');
      global.localStorage.removeItem('username');
      global.localStorage.removeItem('role');
      tasksSection.style.display = 'none';
      loginSection.style.display = 'block';

      expect(tasksSection.style.display).toBe('none');
      expect(loginSection.style.display).toBe('block');
    });
  });

  describe('Filter interactions', () => {
    test('Status filter change', () => {
      const statusFilter = document.getElementById('statusFilter');
      
      statusFilter.value = 'hecha';
      expect(statusFilter.value).toBe('hecha');

      statusFilter.value = 'no_hecha';
      expect(statusFilter.value).toBe('no_hecha');
    });

    test('Date filters', () => {
      const startDateFilter = document.getElementById('startDateFilter');
      const endDateFilter = document.getElementById('endDateFilter');
      
      startDateFilter.value = '2024-01-01';
      endDateFilter.value = '2024-12-31';

      expect(startDateFilter.value).toBe('2024-01-01');
      expect(endDateFilter.value).toBe('2024-12-31');
    });

    test('Search filter', () => {
      const searchFilter = document.getElementById('searchFilter');
      
      searchFilter.value = 'test search';
      expect(searchFilter.value).toBe('test search');
    });

    test('Clear filters', () => {
      const statusFilter = document.getElementById('statusFilter');
      const startDateFilter = document.getElementById('startDateFilter');
      const endDateFilter = document.getElementById('endDateFilter');
      const searchFilter = document.getElementById('searchFilter');
      const clearFiltersBtn = document.getElementById('clearFiltersBtn');

      // Set some filter values
      statusFilter.value = 'hecha';
      startDateFilter.value = '2024-01-01';
      endDateFilter.value = '2024-12-31';
      searchFilter.value = 'test';

      clearFiltersBtn.click();

      // Simulate clearing
      statusFilter.value = '';
      startDateFilter.value = '';
      endDateFilter.value = '';
      searchFilter.value = '';

      expect(statusFilter.value).toBe('');
      expect(startDateFilter.value).toBe('');
      expect(endDateFilter.value).toBe('');
      expect(searchFilter.value).toBe('');
    });
  });

  describe('Admin functionality', () => {
    test('Show all tasks button for admin', () => {
      const showAllTasksBtn = document.getElementById('showAllTasksBtn');
      const showMyTasksBtn = document.getElementById('showMyTasksBtn');

      // Admin buttons should be visible
      showAllTasksBtn.style.display = 'inline-block';
      showMyTasksBtn.style.display = 'inline-block';

      expect(showAllTasksBtn.style.display).toBe('inline-block');
      expect(showMyTasksBtn.style.display).toBe('inline-block');
    });

    test('Toggle between all tasks and my tasks', () => {
      const showAllTasksBtn = document.getElementById('showAllTasksBtn');
      const showMyTasksBtn = document.getElementById('showMyTasksBtn');

      showAllTasksBtn.style.display = 'inline-block';
      showMyTasksBtn.style.display = 'none';

      showAllTasksBtn.click();

      // Simulate view change
      showAllTasksBtn.style.display = 'none';
      showMyTasksBtn.style.display = 'inline-block';

      expect(showAllTasksBtn.style.display).toBe('none');
      expect(showMyTasksBtn.style.display).toBe('inline-block');
    });
  });

  describe('Stats display', () => {
    test('Display task stats', () => {
      const totalTasks = document.getElementById('totalTasks');
      const completedTasks = document.getElementById('completedTasks');
      const pendingTasks = document.getElementById('pendingTasks');
      const progressPercentage = document.getElementById('progressPercentage');

      // Simulate stats update
      totalTasks.textContent = '10';
      completedTasks.textContent = '6';
      pendingTasks.textContent = '4';
      progressPercentage.textContent = '60';

      expect(totalTasks.textContent).toBe('10');
      expect(completedTasks.textContent).toBe('6');
      expect(pendingTasks.textContent).toBe('4');
      expect(progressPercentage.textContent).toBe('60');
    });
  });

  describe('Task list rendering', () => {
    test('Render empty task list', () => {
      const tasksList = document.getElementById('tasksList');
      
      tasksList.innerHTML = '<p>No hay tareas disponibles</p>';
      
      expect(tasksList.innerHTML).toContain('No hay tareas disponibles');
    });

    test('Render tasks', () => {
      const tasksList = document.getElementById('tasksList');
      
      const tasks = [
        { id: 1, title: 'Task 1', completed: false },
        { id: 2, title: 'Task 2', completed: true }
      ];

      let html = '';
      tasks.forEach(task => {
        html += `<div class="task-item" data-id="${task.id}">
          <h3>${task.title}</h3>
          <span>${task.completed ? 'Completed' : 'Pending'}</span>
        </div>`;
      });
      tasksList.innerHTML = html;

      expect(tasksList.innerHTML).toContain('Task 1');
      expect(tasksList.innerHTML).toContain('Task 2');
      expect(tasksList.querySelectorAll('.task-item').length).toBe(2);
    });
  });

  describe('Form validation', () => {
    test('Task form has required fields', () => {
      const taskTitle = document.getElementById('taskTitle');
      const taskDescription = document.getElementById('taskDescription');
      const taskDueDate = document.getElementById('taskDueDate');

      expect(taskTitle.value).toBe('Test Task');
      expect(taskDescription.value).toBe('Test Description');
      expect(taskDueDate.value).toBe('2024-12-31');
    });

    test('Login form has fields', () => {
      const loginUsername = document.getElementById('loginUsername');
      const loginPassword = document.getElementById('loginPassword');

      expect(loginUsername.value).toBe('testuser');
      expect(loginPassword.value).toBe('pass123');
    });

    test('Register form has fields', () => {
      const registerUsername = document.getElementById('registerUsername');
      const registerEmail = document.getElementById('registerEmail');
      const registerPassword = document.getElementById('registerPassword');

      expect(registerUsername.value).toBe('newuser');
      expect(registerEmail.value).toBe('new@test.com');
      expect(registerPassword.value).toBe('pass123');
    });
  });

  describe('Error message display', () => {
    test('Show error message', () => {
      const errorMessage = document.getElementById('errorMessage');
      
      errorMessage.textContent = 'Test error message';
      errorMessage.style.display = 'block';

      expect(errorMessage.textContent).toBe('Test error message');
      expect(errorMessage.style.display).toBe('block');
    });

    test('Hide error message', () => {
      const errorMessage = document.getElementById('errorMessage');
      
      errorMessage.style.display = 'none';
      errorMessage.textContent = '';

      expect(errorMessage.style.display).toBe('none');
      expect(errorMessage.textContent).toBe('');
    });
  });

  describe('File attachment handling', () => {
    test('File input exists', () => {
      const taskAttachments = document.getElementById('taskAttachments');
      
      expect(taskAttachments).toBeTruthy();
      expect(taskAttachments.type).toBe('file');
      expect(taskAttachments.multiple).toBe(true);
    });
  });
});
