/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  
  // Importante: aumentar timeouts para CI
  testTimeout: 30000, // 30 segundos por test
  
  // Cobertura
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'cobertura'],
  
  // Coverage paths - exclude public/app.js from backend testing
  collectCoverageFrom: [
    'src/**/*.js',
    'server.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/tests/**'
  ],
  
  coverageThreshold: {
    global: { 
      lines: 80, 
      functions: 70, 
      branches: 65, 
      statements: 80 
    }
  },
  
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/tests/setupTests.js',
    '<rootDir>/tests/frontend/setupFrontend.js'
  ],
  
  // Configuración de reportes para Azure DevOps
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: './test-results',
        outputName: 'junit.xml',
        ancestorSeparator: ' › ',
        uniqueOutputName: false,
        suiteNameTemplate: '{filepath}',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        addFileAttribute: true
      }
    ]
  ],
  
  // Configuración para CI
  maxWorkers: process.env.CI ? 1 : undefined, // En CI: un worker a la vez
  
  // Detectar leaks de memoria
  detectLeaks: false,
  
  // Verbose en CI para mejor debugging
  verbose: process.env.CI === 'true',
  
  // Forzar salida después de los tests
  forceExit: true,
  
  // No cachear en CI
  cache: process.env.CI !== 'true'
};