# TikTask - Reorganized Structure

This repository has been reorganized to separate frontend and backend for better container management.

## Structure

```
.
├── backend/              # Backend Node.js API
│   ├── src/             # Source code (routes, models, config)
│   ├── tests/           # Backend tests
│   ├── server.js        # Main server file
│   ├── package.json     # Backend dependencies
│   └── Dockerfile       # Backend container configuration
│
├── frontend/            # Frontend static files
│   ├── index.html      # Main HTML file
│   ├── app.js          # Frontend JavaScript
│   ├── styles.css      # Styles
│   ├── nginx.conf      # Nginx configuration
│   └── Dockerfile      # Frontend container configuration
│
└── docker-compose.yml  # Orchestrates both services
```

## Running with Docker

### Using Docker Compose (Recommended)

```bash
docker-compose up --build
```

This will:
- Build and start the backend API on port 3000 (internal)
- Build and start the frontend nginx server on port 80
- The frontend proxies API requests to the backend

Access the application at: http://localhost

### Building Individual Containers

**Backend:**
```bash
cd backend
docker build -t tiktask-backend .
docker run -p 3000:3000 -e DATABASE_PATH=/app/data/database.sqlite -e JWT_SECRET=your-secret tiktask-backend
```

**Frontend:**
```bash
cd frontend
docker build -t tiktask-frontend .
docker run -p 80:80 tiktask-frontend
```

## Development

### Backend Development
```bash
cd backend
npm install
npm run dev
```

### Frontend
Static files served by nginx in production. For development, you can use any static file server or the original monolithic approach.

## Architecture

- **Frontend**: Nginx serves static HTML/CSS/JS files and proxies API requests to the backend
- **Backend**: Node.js Express API handling authentication, tasks, and users
- **Communication**: Frontend makes API calls to `/api/*` which nginx proxies to the backend service

## Benefits of This Structure

1. **Separation of Concerns**: Frontend and backend are completely independent
2. **Scalability**: Can scale frontend and backend independently
3. **Development**: Teams can work on frontend and backend separately
4. **Deployment**: Can deploy and update services independently
5. **Security**: Backend is not directly exposed, only through nginx proxy
