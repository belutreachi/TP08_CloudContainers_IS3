# Guía de Configuración - TP8

Esta guía te llevará paso a paso por la configuración completa del proyecto en GitHub Container Registry y Render.

## 📋 Pre-requisitos

- [ ] Cuenta de GitHub
- [ ] Cuenta de Render.com (crear en https://render.com)
- [ ] Git instalado localmente
- [ ] Docker instalado localmente (opcional, para testing)

## 1️⃣ Configurar GitHub Container Registry

### Paso 1.1: Habilitar permisos de escritura en GitHub Actions

1. Ve a tu repositorio en GitHub
2. Click en **Settings** (Configuración)
3. En el menú lateral, click en **Actions** → **General**
4. Scroll hasta **Workflow permissions**
5. Selecciona: **"Read and write permissions"**
6. Marca: **"Allow GitHub Actions to create and approve pull requests"**
7. Click **Save**

### Paso 1.2: Verificar que el package está público (opcional)

1. Ve a tu perfil de GitHub
2. Click en **Packages**
3. Después del primer build, aparecerá `tp08_cloudcontainers_is3`
4. Click en el package → **Package settings**
5. En **Danger Zone**, puedes cambiar la visibilidad a Public si lo deseas

## 2️⃣ Configurar Render.com

### Paso 2.1: Crear cuenta en Render

1. Ve a https://render.com
2. Click en **Get Started**
3. Regístrate con GitHub (recomendado) o email
4. Verifica tu email

### Paso 2.2: Crear servicio QA

1. En el dashboard de Render, click **New +**
2. Selecciona **Web Service**
3. Conecta tu repositorio de GitHub
   - Si es la primera vez, autoriza a Render
   - Busca `baujuncos/TP08_CloudContainers_IS3`
   - Click **Connect**
4. Configura el servicio QA:
   ```
   Name: tiktask-qa
   Region: Oregon (US West)
   Branch: main
   Runtime: Docker
   Plan: Free
   ```
5. Click en **Advanced** para configurar variables de entorno:
   ```
   NODE_ENV=qa
   PORT=3000
   DATABASE_PATH=/app/data/database.sqlite
   JWT_SECRET=[Click "Generate" para auto-generar]
   RENDER_ENV=qa
   ```
6. Scroll hasta **Persistent Disk**:
   - Click **Add Disk**
   - Name: `tiktask-qa-data`
   - Mount Path: `/app/data`
   - Size: 1 GB
7. Click **Create Web Service**
8. Espera a que el primer deploy complete (5-10 minutos)

### Paso 2.3: Obtener Deploy Hook de QA

1. En el servicio `tiktask-qa`, ve a **Settings**
2. Scroll hasta **Deploy Hook**
3. Click **Create Deploy Hook**
4. **GUARDA esta URL** - la necesitarás en GitHub Secrets
   - Ejemplo: `https://api.render.com/deploy/srv-xxx?key=yyy`

### Paso 2.4: Crear servicio PROD

1. En el dashboard de Render, click **New +**
2. Selecciona **Web Service**
3. Conecta el mismo repositorio
4. Configura el servicio PROD:
   ```
   Name: tiktask-prod
   Region: Oregon (US West)
   Branch: main
   Runtime: Docker
   Plan: Starter ($7/month) ⚠️ Requiere tarjeta de crédito
   ```
5. Click en **Advanced** para configurar variables de entorno:
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_PATH=/app/data/database.sqlite
   JWT_SECRET=[Click "Generate" para auto-generar - DIFERENTE al de QA]
   RENDER_ENV=production
   ```
6. Scroll hasta **Persistent Disk**:
   - Click **Add Disk**
   - Name: `tiktask-prod-data`
   - Mount Path: `/app/data`
   - Size: 1 GB
7. **IMPORTANTE**: En **Auto-Deploy**, desmarca "Auto-deploy"
   - Esto asegura que PROD no se despliegue automáticamente
8. Click **Create Web Service**
9. Espera a que el primer deploy complete

### Paso 2.5: Obtener Deploy Hook de PROD

1. En el servicio `tiktask-prod`, ve a **Settings**
2. Scroll hasta **Deploy Hook**
3. Click **Create Deploy Hook**
4. **GUARDA esta URL** - la necesitarás en GitHub Secrets

## 3️⃣ Configurar GitHub Secrets

### Paso 3.1: Añadir secrets al repositorio

1. Ve a tu repositorio en GitHub
2. Click en **Settings**
3. En el menú lateral, click en **Secrets and variables** → **Actions**
4. Click en **New repository secret**
5. Añade el primer secret:
   ```
   Name: RENDER_QA_DEPLOY_HOOK
   Value: [Pega la URL del deploy hook de QA]
   ```
6. Click **Add secret**
7. Click en **New repository secret** nuevamente
8. Añade el segundo secret:
   ```
   Name: RENDER_PROD_DEPLOY_HOOK
   Value: [Pega la URL del deploy hook de PROD]
   ```
9. Click **Add secret**

## 4️⃣ Configurar GitHub Environments

### Paso 4.1: Crear environment QA

1. En tu repositorio, ve a **Settings**
2. En el menú lateral, click en **Environments**
3. Click **New environment**
4. Nombre: `qa`
5. **No añadas** protection rules (queremos deploy automático)
6. Click **Configure environment**

### Paso 4.2: Crear environment Production

1. Click **New environment**
2. Nombre: `production`
3. Marca **Required reviewers**
4. Añade al menos un reviewer (tu usuario u otro colaborador)
5. Opcionalmente, puedes añadir un **Wait timer** (ej: 5 minutos)
6. Click **Save protection rules**

## 5️⃣ Probar el Pipeline

### Paso 5.1: Hacer un push a main

```bash
# Asegúrate de estar en la rama main
git checkout main

# Haz un cambio pequeño (ej: editar README)
echo "Testing CI/CD" >> README.md

# Commit y push
git add .
git commit -m "Test CI/CD pipeline"
git push origin main
```

### Paso 5.2: Monitorear el pipeline

1. Ve a tu repositorio en GitHub
2. Click en la pestaña **Actions**
3. Verás el workflow "CI/CD Pipeline" ejecutándose
4. Click en el workflow para ver los detalles
5. Observa cada job:
   - ✅ Build and Test
   - ✅ Build and Push Docker Image
   - ✅ Deploy to QA Environment
   - ⏸️ Deploy to Production (esperando aprobación)

### Paso 5.3: Aprobar deploy a producción

1. En el workflow, verás el job "Deploy to Production" con estado "Waiting"
2. Click en **Review deployments**
3. Marca el checkbox de **production**
4. Click **Approve and deploy**
5. El deploy a producción comenzará

### Paso 5.4: Verificar los deploys

#### Verificar QA:
```bash
curl https://tiktask-qa.onrender.com/api/health
# Debe retornar: {"status":"ok","message":"Server is running"}
```

#### Verificar PROD:
```bash
curl https://tiktask-prod.onrender.com/api/health
# Debe retornar: {"status":"ok","message":"Server is running"}
```

**Nota**: Reemplaza las URLs con las URLs reales que te dio Render.

## 6️⃣ Acceder a las aplicaciones

### QA Environment
- URL: `https://tiktask-qa.onrender.com`
- Usuario admin: `admin`
- Password: `Admin123!`

### Production Environment
- URL: `https://tiktask-prod.onrender.com`
- Usuario admin: `admin`
- Password: `Admin123!`

**⚠️ IMPORTANTE**: En el plan Free de QA, el servicio puede entrar en "sleep mode" después de 15 minutos de inactividad. La primera request después del sleep tomará ~1 minuto en responder.

## 7️⃣ Ver logs y monitoreo

### Logs en Render

1. Ve al dashboard de Render
2. Click en el servicio (qa o prod)
3. Click en la pestaña **Logs**
4. Verás logs en tiempo real
5. Puedes buscar y filtrar logs

### Logs en GitHub Actions

1. Ve a la pestaña **Actions** en GitHub
2. Click en cualquier workflow run
3. Click en cualquier job para ver logs detallados
4. Puedes descargar los logs completos

### Métricas en Render

1. En el servicio, click en la pestaña **Metrics**
2. Verás:
   - CPU usage
   - Memory usage
   - Bandwidth
   - Request count

## 8️⃣ Troubleshooting

### Error: "Failed to push to ghcr.io"

**Solución**: Verificar permisos de GitHub Actions (Paso 1.1)

### Error: "Deploy hook failed"

**Solución**: 
1. Verificar que los secrets estén bien configurados
2. Verificar que las URLs de deploy hooks sean correctas
3. Intentar regenerar los deploy hooks en Render

### Error: "Database locked"

**Solución**: 
1. Verificar que el disco persistente esté montado correctamente
2. En Render, ir a Settings → Persistent Disk y verificar mount path

### Free tier entra en sleep mode

**Esperado**: Es normal en el plan Free. Considera:
1. Usar un servicio de "keep-alive" (ej: UptimeRobot)
2. Upgrade a plan Starter para QA también
3. Aceptar el sleep mode para QA (solo para testing)

### Build de Docker falla

**Solución**:
1. Verificar que el Dockerfile esté en la raíz del repo
2. Verificar que .dockerignore no excluya archivos necesarios
3. Ver logs detallados en GitHub Actions

## ✅ Checklist Final

- [ ] GHCR configurado con permisos de escritura
- [ ] Servicio QA creado en Render (Free)
- [ ] Servicio PROD creado en Render (Starter)
- [ ] Deploy hooks obtenidos y guardados
- [ ] GitHub Secrets configurados (2 secrets)
- [ ] GitHub Environments configurados (qa + production)
- [ ] Pipeline ejecutado exitosamente
- [ ] QA desplegado y funcionando
- [ ] PROD desplegado y funcionando
- [ ] Health checks pasando en ambos ambientes
- [ ] Aplicación accesible vía URLs públicas

## 🎉 ¡Felicitaciones!

Has configurado exitosamente:
- ✅ CI/CD completo con GitHub Actions
- ✅ Container Registry (GHCR)
- ✅ Ambientes QA y PROD en la nube
- ✅ Deploy automático a QA
- ✅ Deploy controlado a PROD con approval gate
- ✅ Monitoreo y logs

## 📚 Recursos Adicionales

- [Documentación GitHub Actions](https://docs.github.com/en/actions)
- [Documentación Render](https://render.com/docs)
- [Documentación GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Documentación completa del TP8](./TP8_IMPLEMENTATION.md)

## 💡 Próximos Pasos

1. **Personalizar URLs**: Render permite custom domains
2. **Añadir monitoreo**: Integrar con servicios externos
3. **Añadir más tests**: Expandir la suite de tests
4. **Mejorar seguridad**: Vulnerability scanning, secrets rotation
5. **Optimizar costos**: Analizar uso y ajustar planes

---

**¿Problemas?** Abre un issue en el repositorio o consulta la documentación.
