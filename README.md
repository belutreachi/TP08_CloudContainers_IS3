# TikTask - TP8: Contenedores en la Nube

**Integrantes**: Belén Treachi y Bautista Juncos

Aplicación web de gestión de tareas construida con Node.js, Express y SQLite, implementada con contenedores Docker y CI/CD completo.

---

## 📚 Documentación del TP8

### 🎯 Para completar el TP8, seguí esta guía paso a paso:
➡️ **[GUIA_TP8.md](./GUIA_TP8.md)** - Guía completa con instrucciones detalladas

### 📋 Consignas originales del TP:
➡️ **[TP8_consignas.MD](./TP8_consignas.MD)** - Requisitos y consignas del trabajo práctico

---

## 🚀 Quick Start con Docker

### Probar localmente (recomendado)

```bash
# Iniciar ambos servicios con Docker Compose
docker-compose up --build
```

Acceder a: **http://localhost**

### Arquitectura del Proyecto

```
TP08_CloudContainers_IS3/
├── backend/              # API Node.js + Express
│   ├── Dockerfile       # Imagen Docker del backend
│   └── ...
├── frontend/            # Frontend HTML/CSS/JS + Nginx
│   ├── Dockerfile       # Imagen Docker del frontend
│   └── ...
├── docker-compose.yml   # Orquestación de servicios
└── .github/workflows/   # CI/CD con GitHub Actions
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

## 🏗️ Arquitectura TP8

**Stack implementado (Ejemplo 1 de las consignas):**

```
GitHub Repository
  ↓
GitHub Actions (CI/CD)
  ↓ Build + Test
  ↓ Docker Build + Push
  ↓
GitHub Container Registry (ghcr.io)
  ↓
Deploy automático → Render.com QA (Free)
  ↓ Approval Gate
Deploy manual → Render.com PROD (Starter $7/mo)
```

**Costo total: $7/mes**

### Componentes

- ✅ **Container Registry**: GitHub Container Registry (gratis)
- ✅ **CI/CD**: GitHub Actions (gratis)
- ✅ **QA Environment**: Render.com Free tier (gratis)
- ✅ **PROD Environment**: Render.com Starter ($7/mes)
- ✅ **Pipeline completo**: Build → Test → Deploy QA → Approval → Deploy PROD

---

## 💻 Características de la Aplicación

- ✅ Autenticación de usuarios (registro e inicio de sesión)
- ✅ Gestión de tareas (crear, editar, eliminar, completar)
- ✅ Fechas de vencimiento para tareas
- ✅ Rol de administrador con vista de todas las tareas
- ✅ Diseño responsivo
- ✅ API RESTful segura con JWT
- ✅ Base de datos SQLite

## 🛠️ Tecnologías

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

## 🧪 Desarrollo Local (sin Docker)

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

## 🧪 Testing

```bash
# Ejecutar todos los tests
cd backend
npm test

# Tests con coverage
npm run test:coverage
```

---

## 📖 Más Información

- **Guía completa del TP8**: [GUIA_TP8.md](./GUIA_TP8.md)
- **Consignas originales**: [TP8_consignas.MD](./TP8_consignas.MD)
- **Reportar issues**: [GitHub Issues](https://github.com/baujuncos/TP08_CloudContainers_IS3/issues)

---

## 👥 Autores

**Belén Treachi y Bautista Juncos**  
Ingeniería de Software 3 - TP8

---

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT.
