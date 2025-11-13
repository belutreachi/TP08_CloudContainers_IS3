# TikTask - TP8: Contenedores en la Nube

**Integrantes**: Belén Treachi y Bautista Juncos

Aplicación web de gestión de tareas construida con Node.js, Express y SQLite, implementada con contenedores Docker y CI/CD completo.


## Quick Start con Docker

### Probar localmente (recomendado)

```bash
# Iniciar ambos servicios con Docker Compose
docker-compose up --build
```

Acceder a: **http://localhost**

### Arquitectura del Proyecto

```
TP08_CloudContainers_IS3/
├── backend/                    # API Node.js + Express
│   ├── src/                   # Código fuente
│   ├── tests/                 # Tests unitarios e integración
│   ├── Dockerfile             # Imagen Docker del backend
│   ├── server.js              # Servidor Express
│   └── package.json           # Dependencias
├── frontend/                   # Frontend HTML/CSS/JS + Nginx
│   ├── Dockerfile             # Imagen Docker del frontend
│   ├── nginx.conf             # Configuración Nginx
│   ├── index.html             # Aplicación SPA
│   └── app.js                 # Lógica del cliente
├── docker-compose.yml          # Orquestación local
├── render.yaml                 # Configuración de servicios en Render
├── .github/workflows/          # CI/CD con GitHub Actions
│   └── cicd-pipeline.yml      # Pipeline completo
├── SETUP_GUIDE.md              # Guía de configuración paso a paso
└── README.md                   # Este archivo
```

### Opciones de ejecución

**Opción 1: Docker Compose (recomendado)**
```bash
docker-compose up --build
```
- Backend: puerto 3000 (interno)
- Frontend: puerto 80 (http://localhost)

**Opción 2: Contenedores individuales**
```bash
# Backend
cd backend
docker build -t tiktask-backend .
docker run -p 3000:3000 -e DATABASE_PATH=/app/data/database.sqlite -e JWT_SECRET=dev-secret tiktask-backend

# Frontend (en otra terminal)
cd frontend
docker build -t tiktask-frontend .
docker run -p 80:80 tiktask-frontend
```

---

## Arquitectura TP8

**Stack implementado (Opción 1 - GitHub Stack):**

```
GitHub Repository
  ↓
GitHub Actions (CI/CD)
  ↓ Build & Test Backend
  ↓ Build Docker Images (Frontend + Backend)
  ↓ Push to GitHub Container Registry (GHCR)
  ↓
Deploy automático → Render QA
  ├─ Frontend QA (Free)
  └─ Backend QA (Free)
  ↓ Approval Gate (Manual)
Deploy manual → Render PROD
  ├─ Frontend PROD (Starter $7/mo)
  └─ Backend PROD (Starter $7/mo)
```

**Servicios totales:** 4 servicios (2 en QA, 2 en PROD)
**Imágenes Docker:** 2 imágenes (reutilizadas en ambos ambientes)

**Costo total: $14/mes** (o puedes usar Free tier en ambos ambientes = $0)

### Componentes

- **Container Registry**: GitHub Container Registry (gratis)
- **CI/CD**: GitHub Actions (gratis)
- **QA Environment**: Render.com
  - Frontend QA (Free tier)
  - Backend QA (Free tier)
- **PROD Environment**: Render.com
  - Frontend PROD (Starter $7/mes)
  - Backend PROD (Starter $7/mes)
- **Pipeline completo**: Build → Test → Push Images → Deploy QA → Approval → Deploy PROD

---

## Características de la Aplicación

- ✅ Autenticación de usuarios (registro e inicio de sesión)
- ✅ Gestión de tareas (crear, editar, eliminar, completar)
- ✅ Fechas de vencimiento para tareas
- ✅ Rol de administrador con vista de todas las tareas
- ✅ Diseño responsivo
- ✅ API RESTful segura con JWT
- ✅ Base de datos SQLite

## Tecnologías

### Backend
- **Node.js**: Runtime de JavaScript
- **Express**: Framework web
- **SQLite**: Base de datos
- **JWT (JSON Web Tokens)**: Autenticación
- **BCrypt**: Hash de contraseñas

### Frontend
- **HTML/CSS/JavaScript**: Frontend sin frameworks
- **Nginx**: Servidor web para archivos estáticos

### DevOps & Cloud
- **Docker**: Contenedorización
- **GitHub Actions**: CI/CD
- **GitHub Container Registry**: Almacenamiento de imágenes
- **Render.com**: Hosting en la nube

---

## Desarrollo Local (sin Docker)

### Requisitos
- Node.js 18+
- npm

### Instalación y Ejecución

```bash
# 1. Clonar el repositorio
git clone https://github.com/baujuncos/TP08_CloudContainers_IS3.git
cd TP08_CloudContainers_IS3

# 2. Instalar dependencias del backend
cd backend
npm install

# 3. Iniciar el servidor
npm start
```

El servidor se ejecutará en `http://localhost:3000`

### Credenciales por Defecto

**Usuario Administrador:**
- Usuario: `admin`
- Contraseña: `Admin123!`

---

## Testing

```bash
# Ejecutar todos los tests
cd backend
npm test

# Tests con coverage
npm run test:coverage
```

---

## 👥 Autores

**Belén Treachi y Bautista Juncos**  
Ingeniería de Software 3 - TP8