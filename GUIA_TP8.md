# Guía Completa - TP8: Contenedores en la Nube

## 📋 Resumen del Proyecto

Este proyecto implementa el **TP8** siguiendo la **Arquitectura Ejemplo 1** de las consignas (100% gratis):

```
GitHub Repository
  → GitHub Actions (CI/CD)
    → Build + Test
    → Docker Build
    → Push to GitHub Container Registry (ghcr.io)
    → Deploy to Render.com QA (1 instancia, 512MB RAM)
    → Approval Gate
    → Deploy to Render.com PROD (2 instancias, 1GB RAM, auto-scaling)
```

**Stack Tecnológico:**
- **Aplicación**: TikTask (gestión de tareas)
- **Backend**: Node.js + Express + SQLite
- **Frontend**: HTML/CSS/JavaScript + Nginx
- **Container Registry**: GitHub Container Registry (ghcr.io) - GRATIS
- **CI/CD**: GitHub Actions - GRATIS
- **QA Environment**: Render.com (Free tier) - GRATIS
- **PROD Environment**: Render.com (Starter tier) - $7/mes

**Costo Total**: $7/mes

---

## 🎯 Objetivos del TP8

Según las consignas, debes demostrar que comprendés:
1. ✅ Contenedores y su orquestación (Docker + Docker Compose)
2. ✅ Servicios de contenedores en la nube (Render.com)
3. ✅ CI/CD con contenedores (GitHub Actions)
4. ✅ Decisiones arquitectónicas justificadas (documentación)

---

## 🏗️ Arquitectura Implementada

### Estructura del Proyecto

```
TP08_CloudContainers_IS3/
├── backend/                    # Backend Node.js
│   ├── src/                   # Código fuente
│   ├── tests/                 # Tests
│   ├── server.js              # Servidor Express
│   ├── package.json           # Dependencias
│   └── Dockerfile             # Imagen Docker backend
├── frontend/                   # Frontend estático
│   ├── index.html             # Aplicación SPA
│   ├── app.js                 # Lógica del cliente
│   ├── styles.css             # Estilos
│   ├── nginx.conf             # Config nginx
│   └── Dockerfile             # Imagen Docker frontend
├── docker-compose.yml          # Orquestación local
├── render.yaml                 # Config Render (IaC)
├── .github/workflows/          # CI/CD
│   └── ci-cd.yml              # Pipeline completo
├── TP8_consignas.MD           # Consignas del TP
└── GUIA_TP8.md                # Esta guía
```

### Flujo de Deployment

```
┌─────────────────────────────────────────────────────┐
│                   GitHub Repository                  │
│                   (main branch)                      │
└────────────────────┬────────────────────────────────┘
                     │ git push
                     ↓
┌─────────────────────────────────────────────────────┐
│              GitHub Actions Pipeline                 │
│                                                      │
│  [1] Build & Test                                   │
│      └─ npm test (156 tests)                        │
│                                                      │
│  [2] Docker Build & Push                            │
│      ├─ Build: backend + frontend                   │
│      ├─ Tag: main-{sha}                             │
│      └─ Push: ghcr.io                               │
│                                                      │
│  [3] Deploy QA (Automático)                         │
│      └─ Render QA (Free)                            │
│                                                      │
│  [4] ⏸️  Approval Gate (Manual)                      │
│                                                      │
│  [5] Deploy PROD (Después de aprobación)            │
│      └─ Render PROD (Starter)                       │
└─────────────────────────────────────────────────────┘
```

---

## 📦 Contenedores Docker

### Backend Dockerfile (`backend/Dockerfile`)

**Características:**
- Base: `node:18-alpine` (imagen pequeña y segura)
- Multi-stage build para optimización
- Usuario no-root (`node`) para seguridad
- Health check en `/api/health`
- Volúmenes para datos persistentes

### Frontend Dockerfile (`frontend/Dockerfile`)

**Características:**
- Base: `nginx:alpine`
- Sirve archivos estáticos eficientemente
- Proxy de API requests a backend
- Health check configurado
- Configuración nginx optimizada

### Docker Compose (`docker-compose.yml`)

**Servicios:**
- **backend**: API Node.js en puerto 3000 (interno)
- **frontend**: Nginx en puerto 80 (expuesto)

**Para probar localmente:**
```bash
docker-compose up --build
```

Acceder en: http://localhost

---

## 🚀 Paso a Paso: Implementación del TP8

### Paso 1: Verificación Local (15 minutos)

#### 1.1. Verificar que todo funciona localmente

```bash
# Clonar el repositorio (si aún no lo tienes)
git clone https://github.com/baujuncos/TP08_CloudContainers_IS3.git
cd TP08_CloudContainers_IS3

# Probar con Docker Compose
docker-compose up --build
```

**Verificar:**
- ✅ Backend corre en puerto 3000
- ✅ Frontend corre en puerto 80
- ✅ Puedes acceder a http://localhost
- ✅ Puedes crear una cuenta y agregar tareas

#### 1.2. Verificar tests

```bash
cd backend
npm install
npm test
```

**Resultado esperado:** 156 tests passing ✅

---

### Paso 2: Configurar GitHub (10 minutos)

#### 2.1. Habilitar GitHub Container Registry

1. Ve a tu repositorio en GitHub
2. **Settings** → **Actions** → **General**
3. Scroll hasta **Workflow permissions**
4. Selecciona: **"Read and write permissions"** ✅
5. Marca: **"Allow GitHub Actions to create and approve pull requests"** ✅
6. Click **Save**

#### 2.2. Crear GitHub Environments

1. **Settings** → **Environments**
2. Click **New environment**

**Environment 1: `qa`**
- Nombre: `qa`
- Protection rules: Ninguna (deploy automático)
- Click **Configure environment**

**Environment 2: `production`**
- Nombre: `production`
- Protection rules:
  - ✅ **Required reviewers**: Agregar tu usuario
  - ⏱️ **Wait timer**: 0 minutos (opcional)
- Click **Save protection rules**

---

### Paso 3: Configurar Render.com (20 minutos)

#### 3.1. Crear cuenta en Render

1. Ve a https://render.com
2. Click **Get Started**
3. Regístrate con GitHub (recomendado)
4. Autoriza a Render para acceder a tu repositorio

#### 3.2. Crear servicio QA

1. Dashboard de Render → **New +** → **Web Service**
2. Selecciona tu repositorio: `baujuncos/TP08_CloudContainers_IS3`
3. Configurar:

```
Name: tiktask-qa
Region: Oregon (US West)
Branch: main
Runtime: Docker
Root Directory: backend
Dockerfile Path: backend/Dockerfile
Plan: Free
```

4. **Environment Variables** (click Advanced):
```
NODE_ENV=qa
PORT=3000
DATABASE_PATH=/app/data/database.sqlite
JWT_SECRET=[Click "Generate"]
RENDER_ENV=qa
```

5. **Persistent Disk**:
   - Click **Add Disk**
   - Name: `tiktask-qa-data`
   - Mount Path: `/app/data`
   - Size: 1 GB

6. Click **Create Web Service**
7. Espera que el primer deploy complete (~5-10 min)

#### 3.3. Obtener Deploy Hook de QA

1. En el servicio `tiktask-qa` → **Settings**
2. Scroll hasta **Deploy Hook**
3. Click **Create Deploy Hook**
4. **COPIA esta URL** (la necesitarás pronto)
   - Formato: `https://api.render.com/deploy/srv-xxx?key=yyy`

#### 3.4. Crear servicio PROD

**⚠️ IMPORTANTE**: Este servicio requiere tarjeta de crédito ($7/mes)

1. Dashboard de Render → **New +** → **Web Service**
2. Selecciona el mismo repositorio
3. Configurar:

```
Name: tiktask-prod
Region: Oregon (US West)
Branch: main
Runtime: Docker
Root Directory: backend
Dockerfile Path: backend/Dockerfile
Plan: Starter ($7/month)
```

4. **Environment Variables**:
```
NODE_ENV=production
PORT=3000
DATABASE_PATH=/app/data/database.sqlite
JWT_SECRET=[Click "Generate" - ⚠️ DIFERENTE al de QA]
RENDER_ENV=production
```

5. **Persistent Disk**:
   - Click **Add Disk**
   - Name: `tiktask-prod-data`
   - Mount Path: `/app/data`
   - Size: 1 GB

6. **Auto-Deploy**: ⚠️ DESMARCA "Auto-deploy"
   - Esto asegura que PROD solo se deploya con aprobación

7. Click **Create Web Service**
8. Espera que complete (~5-10 min)

#### 3.5. Obtener Deploy Hook de PROD

1. En el servicio `tiktask-prod` → **Settings**
2. Scroll hasta **Deploy Hook**
3. Click **Create Deploy Hook**
4. **COPIA esta URL**

---

### Paso 4: Configurar GitHub Secrets (5 minutos)

1. Ve a tu repositorio en GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

**Secret 1:**
```
Name: RENDER_QA_DEPLOY_HOOK
Value: [Pega la URL del deploy hook de QA]
```
Click **Add secret**

**Secret 2:**
```
Name: RENDER_PROD_DEPLOY_HOOK
Value: [Pega la URL del deploy hook de PROD]
```
Click **Add secret**

---

### Paso 5: Activar el Pipeline (10 minutos)

#### 5.1. Hacer un push para activar el pipeline

```bash
# En tu repositorio local
git checkout main
git pull origin main

# Hacer un cambio pequeño para activar el pipeline
echo "# Pipeline activado" >> README.md

git add .
git commit -m "Activar pipeline CI/CD"
git push origin main
```

#### 5.2. Monitorear el Pipeline

1. Ve a tu repositorio en GitHub
2. Click en la pestaña **Actions**
3. Verás el workflow ejecutándose
4. Click en el workflow run para ver detalles

**Observa los jobs:**
- ✅ Job 1: Build and Test (~2 min)
- ✅ Job 2: Build and Push Docker Image (~5 min)
- ✅ Job 3: Deploy to QA Environment (~3 min)
- ⏸️ Job 4: Deploy to Production (esperando aprobación)

#### 5.3. Verificar QA

```bash
# Espera a que QA termine
# Luego verifica (reemplaza con tu URL de Render)
curl https://tiktask-qa.onrender.com/api/health
```

**Resultado esperado:**
```json
{"status":"ok","message":"Server is running"}
```

Accede a tu URL de QA en el navegador y verifica que funciona.

#### 5.4. Aprobar Deploy a PROD

1. En el workflow, verás el job "Deploy to Production" con estado **"Waiting"**
2. Click en **Review deployments**
3. Marca el checkbox de **production** ✅
4. Click **Approve and deploy**
5. El deploy a PROD comenzará

#### 5.5. Verificar PROD

```bash
# Después de que PROD termine
curl https://tiktask-prod.onrender.com/api/health
```

Accede a tu URL de PROD en el navegador.

---

## ✅ Checklist de Verificación

### Configuración Completa

- [ ] Repositorio clonado localmente
- [ ] Docker Compose funciona localmente
- [ ] Tests pasan (156/156)
- [ ] GitHub: Permisos de escritura habilitados
- [ ] GitHub: Environments creados (qa + production)
- [ ] GitHub: Secrets configurados (2 secrets)
- [ ] Render: Servicio QA creado (Free)
- [ ] Render: Servicio PROD creado (Starter)
- [ ] Render: Deploy hooks copiados
- [ ] Pipeline ejecutado exitosamente
- [ ] QA desplegado y funcionando
- [ ] PROD desplegado y funcionando

### Funcionalidad

- [ ] Puedes acceder a la URL de QA
- [ ] Puedes acceder a la URL de PROD
- [ ] Health check responde en QA
- [ ] Health check responde en PROD
- [ ] Puedes crear una cuenta y agregar tareas en ambos ambientes

---

## 📊 Comparación QA vs PROD

| Aspecto | QA | PROD | Justificación |
|---------|-----|------|---------------|
| **Plan Render** | Free | Starter ($7/mo) | QA puede tolerar sleep mode |
| **Instancias** | 1 | 1 (escalable) | Suficiente para carga actual |
| **RAM** | 512 MB | 512 MB | Aplicación ligera |
| **CPU** | Compartida | Compartida | Costo-efectivo |
| **Deploy** | Automático | Manual + Approval | Control en producción |
| **Uptime** | Sleep después 15min | 24/7 | PROD siempre activo |
| **Disco** | 1 GB persistente | 1 GB persistente | SQLite funciona bien |
| **Monitoreo** | Básico | Básico + alerts | PROD necesita más observabilidad |
| **Costo** | $0/mes | $7/mes | **Total: $7/mes** |

---

## 🔍 Decisiones Arquitectónicas Justificadas

### ¿Por qué GitHub Stack?
✅ **Integración nativa**: Todo en un ecosistema (repo + CI/CD + registry)
✅ **Costo**: Completamente gratis para CI/CD y registry
✅ **Simplicidad**: Menos herramientas = menos complejidad
✅ **Documentación**: Excelente y abundante

### ¿Por qué Render.com?
✅ **Simplicidad**: Deploy en minutos, sin configuración compleja
✅ **HTTPS automático**: Sin necesidad de configurar certificados
✅ **Free tier generoso**: Perfecto para ambiente QA
✅ **Persistencia incluida**: Discos para SQLite sin costo extra
✅ **Confiable**: Buena uptime y soporte

### ¿Por qué mismo servicio para QA y PROD?
✅ **Consistencia**: Mismo runtime, menos sorpresas entre ambientes
✅ **Simplicidad**: Un solo servicio que aprender y dominar
✅ **Costo-efectivo**: Free tier + starter es muy económico ($7/mo total)
✅ **Diferenciación por configuración**: Plan, recursos, auto-deploy

**Alternativa considerada**: Usar servicios diferentes
- ❌ Más complejo de mantener
- ❌ Requiere aprender dos plataformas
- ✅ Mayor redundancia (ventaja en producción real)

### ¿Por qué SQLite?
✅ **Simplicidad**: Sin DB externa que administrar
✅ **Costo**: $0 adicionales, sin servidor DB separado
✅ **Persistencia**: Con volúmenes funciona perfectamente
✅ **Suficiente**: Para aplicación de demo con carga baja-media

**Limitación conocida**: No apto para alta concurrencia (100+ usuarios simultáneos)

**Plan de migración**: Si la aplicación crece, migrar a PostgreSQL en Railway/Supabase

---

## 🔐 Seguridad

### Medidas Implementadas

✅ **Container Security**:
- Usuario no-root en contenedores
- Imagen base Alpine (menor superficie de ataque)
- Multi-stage builds (menos vulnerabilidades)

✅ **Secrets Management**:
- GitHub Secrets para credentials
- Environment variables en Render
- JWT_SECRET auto-generado y único por ambiente

✅ **Network Security**:
- HTTPS automático en Render
- CORS configurado en backend
- Helmet.js para headers seguros

✅ **Application Security**:
- BCrypt para passwords
- JWT para autenticación
- Rate limiting en API
- Validación de inputs

---

## 📈 Escalabilidad

### Escalabilidad Actual
- **QA**: No requiere escalado (testing manual limitado)
- **PROD**: Escalado manual en Render (aumentar instancias)

### ¿Cuándo migrar a Kubernetes?

Considera Kubernetes cuando:
- ✅ Tienes **más de 10 servicios** diferentes
- ✅ Necesitas **auto-scaling** basado en métricas personalizadas
- ✅ Requieres **multi-cloud** o **hybrid cloud**
- ✅ Tu equipo tiene **expertise en Kubernetes**
- ✅ Justificas la **complejidad adicional**

Para esta aplicación actual: **NO es necesario Kubernetes**
- Solo 2 servicios (backend + frontend)
- Carga baja-media
- Render.com es suficiente y más simple

### Si la aplicación crece 10x

**Cambios necesarios:**
1. **Base de datos**: Migrar de SQLite a PostgreSQL
2. **Caché**: Añadir Redis para sesiones
3. **CDN**: Cloudflare para assets estáticos
4. **Monitoreo**: Prometheus + Grafana
5. **Auto-scaling**: Configurar en Render o migrar a Kubernetes
6. **Load balancer**: Si múltiples regiones

---

## 🛠️ Operaciones

### Ver Logs

**En Render:**
1. Dashboard → Servicio
2. Tab **Logs**
3. Live tail habilitado

**En GitHub Actions:**
1. Repository → **Actions**
2. Click en workflow run
3. Click en job para ver logs detallados

### Rollback

**Opción 1: Rollback en Render (rápido)**
1. Dashboard → Servicio → **Deploys**
2. Click en deploy anterior exitoso
3. Click **Redeploy**

**Opción 2: Rollback via CI/CD**
1. GitHub → **Actions**
2. Buscar workflow run exitoso anterior
3. Click **Re-run jobs**

### Hacer un Cambio y Deployarlo

```bash
# 1. Hacer cambio en el código
echo "// Cambio de prueba" >> backend/server.js

# 2. Commit y push
git add .
git commit -m "feat: cambio de prueba"
git push origin main

# 3. Monitorear en GitHub Actions
# El pipeline se ejecutará automáticamente

# 4. Verificar en QA
# Esperar a que QA termine

# 5. Aprobar PROD
# Ir a GitHub Actions → Review deployments → Approve
```

---

## 📚 Documentación para la Defensa

### Preguntas Frecuentes en la Defensa

**1. ¿Por qué elegiste ese stack tecnológico específico?**
- Node.js: Ampliamente usado, fácil de contenedorizar
- SQLite: Simple, sin costos adicionales, suficiente para demo
- GitHub Actions: Gratis, integrado con el repo
- Render: Simple, free tier generoso, HTTPS automático

**2. ¿Cómo manejás los secretos en tu pipeline?**
- GitHub Secrets para deploy hooks
- Environment variables en Render
- JWT_SECRET auto-generado por Render
- No hay secrets hardcodeados en el código

**3. ¿Qué estrategia de versionado usás para tus imágenes Docker?**
- Tag por commit SHA: `main-abc1234` (inmutable)
- Tag por rama: `main`, `develop`
- Tag `latest` para última versión de main
- NO usamos solo `latest` para permitir rollbacks

**4. ¿Cómo optimizaste tus Dockerfiles?**
- Multi-stage builds
- Imagen base Alpine (pequeña)
- .dockerignore para excluir archivos innecesarios
- Cache de capas de npm install

**5. ¿Cómo implementarías un rollback si un deploy falla en producción?**
- Opción 1: Redeploy de versión anterior en Render (2 min)
- Opción 2: Re-run de workflow anterior en GitHub Actions
- Todas las imágenes tienen tag SHA para trazabilidad

**6. ¿Cómo tu pipeline diferencia entre deploy a QA y PROD?**
- QA: Deploy automático después de build exitoso
- PROD: Requiere aprobación manual (GitHub Environment)
- Diferentes secrets (RENDER_QA_DEPLOY_HOOK vs RENDER_PROD_DEPLOY_HOOK)
- Diferentes variables de entorno en cada servicio

**7. ¿Qué harías diferente en una implementación productiva real con usuarios reales?**
- Migrar de SQLite a PostgreSQL
- Añadir Redis para caché
- Implementar monitoring (Prometheus + Grafana)
- Añadir alertas automáticas
- Implementar backups automáticos
- Añadir más tests (E2E con Cypress)
- Security scanning (Trivy, Snyk)
- Multiple regiones para HA

---

## 💰 Análisis de Costos

### Costo Mensual Total: $7

| Servicio | Plan | Costo Mensual |
|----------|------|---------------|
| GitHub Actions | Free (2000 min) | $0 |
| GitHub Container Registry | Free (500 MB) | $0 |
| Render QA | Free | $0 |
| Render PROD | Starter | $7 |
| **TOTAL** | | **$7/mes** |

### Comparación con Alternativas

| Alternativa | Costo Mensual | Pros | Contras |
|-------------|---------------|------|---------|
| **Render (elegida)** | $7 | Simple, HTTPS gratis | Sleep mode en free tier |
| Railway | $5 + uso | Deploy rápido | Costos variables |
| Fly.io | $0-10 | Edge global | Más complejo |
| Heroku | $7-25 | Muy simple | Más caro |
| Azure Container Instances | $15-30 | Integración Azure | Requiere créditos |

---

## 🎓 Aprendizajes del TP8

### Conceptos Aplicados

✅ **Contenedores**:
- Dockerfiles optimizados
- Multi-stage builds
- Seguridad (non-root)
- Health checks

✅ **CI/CD**:
- Pipeline automatizado
- Quality gates
- Approval workflows
- Automated deployments

✅ **Cloud**:
- Container hosting
- Environment segregation
- Infrastructure as Code
- Secrets management

✅ **DevOps**:
- Automation
- Testing strategies
- Deployment strategies
- Monitoring basics

---

## 🆘 Troubleshooting

### Error: "Failed to push to ghcr.io"
**Solución**: Verificar permisos de GitHub Actions (Paso 2.1)

### Error: "Deploy hook failed"
**Solución**: 
1. Verificar que los secrets estén configurados correctamente
2. Regenerar deploy hooks en Render
3. Actualizar secrets en GitHub

### Free tier entra en sleep mode
**Esperado**: Es normal en el plan Free después de 15 min de inactividad.
**Solución para QA**: Aceptable, es solo para testing
**Solución para PROD**: Usar plan Starter ($7/mo)

### Tests fallan localmente
```bash
cd backend
rm -rf node_modules
npm install
npm test
```

### Docker Compose no inicia
```bash
# Limpiar todo
docker-compose down -v
docker system prune -a

# Rebuild
docker-compose up --build
```

---

## ✅ Checklist Final para Entregar

### Repositorio
- [ ] Código fuente actualizado
- [ ] Dockerfiles optimizados (backend + frontend)
- [ ] docker-compose.yml funcionando
- [ ] GitHub Actions workflow funcionando
- [ ] README.md actualizado
- [ ] Esta guía (GUIA_TP8.md)

### Servicios Cloud
- [ ] GitHub Container Registry funcionando
- [ ] QA desplegado en Render (Free)
- [ ] PROD desplegado en Render (Starter)
- [ ] URLs públicas funcionando
- [ ] Health checks pasando

### Pipeline CI/CD
- [ ] Build y test automáticos
- [ ] Push a GHCR funcionando
- [ ] Deploy automático a QA
- [ ] Approval gate configurado
- [ ] Deploy manual a PROD funcionando

### Documentación
- [ ] TP8_consignas.MD (consignas originales)
- [ ] GUIA_TP8.md (esta guía completa)
- [ ] README.md (quick start)
- [ ] Decisiones justificadas
- [ ] Comparación QA vs PROD
- [ ] Análisis de costos

---

## 🎉 ¡Felicitaciones!

Si llegaste hasta acá y completaste todos los pasos, tenés:

✅ Una aplicación completamente contenedorizada
✅ CI/CD funcionando end-to-end
✅ Dos ambientes (QA y PROD) en la nube
✅ Pipeline automatizado con approval gates
✅ Container registry configurado
✅ Documentación completa y justificada

**¡Estás listo para la defensa del TP8!**

---

## 📞 Recursos Adicionales

- [Consignas del TP8](./TP8_consignas.MD)
- [README del proyecto](./README.md)
- [Documentación Docker](https://docs.docker.com/)
- [Documentación GitHub Actions](https://docs.github.com/actions)
- [Documentación Render](https://render.com/docs)

---

**Autores**: Belén Treachi y Bautista Juncos
**Materia**: Ingeniería de Software 3
**Trabajo Práctico**: TP8 - Contenedores en la Nube
