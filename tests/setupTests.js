const fs = require('fs');
const os = require('os');
const path = require('path');

// IMPORTANTE: Configurar ambiente ANTES de importar módulos
process.env.NODE_ENV = 'test';
process.env.DATABASE_PATH = ':memory:';
process.env.JWT_SECRET = 'test-secret-key-for-ci';
process.env.PORT = '3001';

// Carpeta temporal para uploads de multer
const tmpUploads = fs.mkdtempSync(path.join(os.tmpdir(), 'tiktask-uploads-'));
process.env.UPLOADS_DIR = tmpUploads;

// Limpiar al finalizar TODOS los tests
afterAll(() => {
  try { 
    fs.rmSync(tmpUploads, { recursive: true, force: true }); 
  } catch (err) {
    // Ignorar errores de limpieza
  }
});

// Importar DESPUÉS de configurar las variables de entorno
const { db, initDb } = require('../src/config/database');
const { seedAdmin } = require('../src/seed');

// Variable global para tracking de inicialización
let isDbInitialized = false;

beforeAll(async () => {
  if (!isDbInitialized) {
    try {
      await initDb();
      await seedAdmin();
      isDbInitialized = true;
      console.log('✅ Database initialized for tests');
    } catch (error) {
      console.error('❌ Error initializing database:', error);
      throw error;
    }
  }
}, 30000); // Timeout de 30 segundos

// Limpiar la base de datos entre cada test
afterEach(async () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('DELETE FROM tasks', (err) => {
        if (err) console.error('Error cleaning tasks:', err);
      });
      db.run('DELETE FROM task_attachments', (err) => {
        if (err) console.error('Error cleaning attachments:', err);
        resolve();
      });
    });
  });
});

// Cerrar la conexión al finalizar
afterAll((done) => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    }
    done();
  });
});