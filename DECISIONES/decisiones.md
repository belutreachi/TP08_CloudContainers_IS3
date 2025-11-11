# decisiones.md - TP08 Automatización y Contenedores en la nube - Ing de Software 3

## App utilizada para el TP
Para este TP usaremos una aplicación web full-stack construida con Node.js y Express, usando una base de datos SQLite. 
La aplicación llamada **TikTask** es un gestor de tareas donde se le permite a los usuarios registrarse, iniciar sesión, crear y gestionar tareas personales, hacer búsquedas filtradas de las mismas y ver estadísticas sobre su avance. El usuario administrador además puede gestionar usuarios y ver las tareas de todos.

## Reestructuración del proyecto
Antes de empezar a desarrollar el TP y con el objetivo de cumplir con las consignas del trabajo práctico y aplicar buenas prácticas de arquitectura basadas en contenedores, se reorganizó el proyecto separando la aplicación en dos módulos independientes:
- `backend/`: Servicios API (Node.js + Express + SQLite).
- `frontend/`: Interfaz web estática (HTML/CSS/JS) servida luego por Nginx.

![alt text](image.png)
![alt text](image-1.png)

Esta reestructuración sigue el enfoque recomendado para aplicaciones contenedorizadas donde cada servicio debe tener su propio entorno de ejecución y su propio Dockerfile.

## Herramientas/plataformas utilizadas y por qué

# Desarrollo del TP

## 1. Preparación del proyecto

### 1.1. Crear archivos `Dockerfile`
Creamos los siguientes archivos:
- `backend/Dockerfile`: Imagen de la API Node/Express.
- `frontend/Dockerfile`: Imagen del frontend servido por Nginx.
- `frontend/nginx.conf`: Configuración de Nginx para servir la UI.
- `.dockerignore` en ambos módulos para reducir el tamaño de imágenes y evitar archivos innecesarios.
- `docker-compose.yml` en la raíz para ejecutar ambos servicios localmente y validar la arquitectura.

Creamos los dockerfiles para la creación de imágenes docker.

## 2. Configuración de Container Registry
Para esta parte decidimos usar **GitHub Container Registry (GHCR)** y vamos a configurar todo desde la terminal.
**Justificación**: 
*Ventajas técnicas:*
- **Integración nativa con GitHub**: El repositorio del proyecto ya está en GitHub, lo que facilita la configuración de GitHub Actions para CI/CD
- **Coste cero**: Almacenamiento ilimitado para imágenes públicas y generoso para privadas dentro del plan gratuito
- **Control de visibilidad**: Permite cambiar entre público/privado según el ambiente (QA público, PROD privado si es necesario)
- **Autenticación simple**: PAT (Personal Access Token) con scopes granulares
- **Compatibilidad con servicios cloud**: Render, Railway, Fly.io y otros servicios gratuitos soportan pull desde GHCR público
- **Versionado por tags**: Naming estándar `ghcr.io/<owner>/<image>:<tag>` (ej: `qa-1`, `prod-1`, commit SHA)

**Alternativas consideradas y por qué no las elegimos:**

| Registry | Ventaja | Desventaja para este TP |
|----------|---------|-------------------------|
| Docker Hub | Más conocido | Solo 1 repo privado gratis, rate limits agresivos |
| Azure ACR | Integración con Azure | Costo (~$5/mes mínimo), overkill para este proyecto |
| GitLab CR | Similar a GHCR | Repositorio ya está en GitHub, duplicaría trabajo |
| AWS ECR | Robusto | Requiere cuenta AWS, configuración más compleja |

**Conclusión**: GHCR es la opción óptima para este TP por costo cero, simplicidad y compatibilidad con nuestro stack.

### 2.1. Login en GHCR
1. Creo un Personal Access Token con permisos:
- `write:packages` - Para subir imágenes
- `read:packages` - Para descargar imágenes
- `delete:packages` - Para eliminar versiones antiguas (housekeeping)
- `workflow` - Para integración con GitHub Actions (próximo paso)

![alt text](image-3.png)
![alt text](image-4.png)

2. Me logueo en GHCR:
En la terminal corro lo siguiente:
```bash
export CR_PAT=mi_token
echo $CR_PAT | docker login ghcr.io -u belutreachi --password-stdin
```
![alt text](image-5.png)
Lo que hice fue guardar el token que creé en una variable de entorno temporal y loguearme con mi usuario de GitHub.

### 2.2. Build y tag del backend
Desde la raíz del repo corro lo siguiente en la terminal:
```bash
# Habilitar builder multi-arquitectura (lo hago 1 sola vez)
docker buildx create --use

# Build para linux/amd64 (Render/GHCR) y tag
docker buildx build \
  --platform linux/amd64 \
  -f backend/Dockerfile \
  -t ghcr.io/belutreachi/tiktask-api:qa-1 \
  --load \
  ./backend

# (Opcional) otro tag, por ejemplo el commit corto
GIT_SHA=$(git rev-parse --short HEAD)
docker tag ghcr.io/belutreachi/tiktask-api:qa-1 ghcr.io/belutreachi/tiktask-api:$GIT_SHA
```
![alt text](image-6.png)

Hago push:
```bash
docker push ghcr.io/belutreachi/tiktask-api:qa-1
docker push ghcr.io/belutreachi/tiktask-api:$GIT_SHA
```
![alt text](image-7.png)

### 2.3. Build y tag del frontend
Desde la raíz del repo corro lo siguiente en la terminal:
```bash
docker buildx build \
  --platform linux/amd64 \
  -f frontend/Dockerfile \
  -t ghcr.io/belutreachi/tiktask-web:qa-1 \
  --load \
  ./frontend

# (Opcional) tag por commit
docker tag ghcr.io/belutreachi/tiktask-web:qa-1 ghcr.io/belutreachi/tiktask-web:$GIT_SHA
```
![alt text](image-8.png)

Hago push:
```bash
docker push ghcr.io/belutreachi/tiktask-web:qa-1
docker push ghcr.io/belutreachi/tiktask-web:$GIT_SHA
```
![alt text](image-9.png)

### 2.4. Verificación rápida en GHCR
Verificamos que se hayan creado correctamente en GitHub Packages:
![alt text](image-10.png)
Les cambio a visibilidad a pública para evitar problemas con render:
![alt text](image-11.png)

### 2.5. Probar ejecución local tirando desde GHCR (sin mi contexto)
Para simular un "entorno limpio" y verificar que las imágenes funcionan correctamente desde el registry, creé un archivo `docker-compose.yml` en la raíz del proyecto que utiliza directamente las imágenes subidas a GHCR.

## 3. Deploy en Ambiente QA
Para este paso decidimos usar **Render**.
**Justificación**:


### 3.1. Crear cuenta en Render
Fui a https://render.com y me registré usando mi cuenta de GitHub. 

### 3.2. Deploy del Backend
1. Crear Web Service para el Backend.
En el board de services de Render voy a **Web Services** → **New Web Service**
![alt text](image-12.png)
