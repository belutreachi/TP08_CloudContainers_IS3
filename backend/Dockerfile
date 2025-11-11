# Multi-stage build for optimized image size
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies for sqlite3
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for build)
RUN npm install && npm cache clean --force

# Production stage
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy dependencies from builder (already includes sqlite3 binaries)
COPY --from=builder /app/node_modules ./node_modules

# Copy application files
COPY . .

# Create directory for database with proper permissions
RUN mkdir -p /app/data && chown -R node:node /app/data

# Create uploads directory
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads

# Use non-root user for security
USER node

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "server.js"]
