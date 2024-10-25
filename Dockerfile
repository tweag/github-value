# Stage 1: Build the backend
FROM node:23 AS backend-builder
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm install
COPY backend/ ./
RUN npm run build

# Stage 2: Build the frontend
FROM node:23 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 3: Create the final image
FROM node:23
WORKDIR /app

# Copy backend build
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/package.json ./backend/package.json
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder /app/backend/github-manifest.json ./backend/github-manifest.json

# Copy frontend build
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
COPY --from=frontend-builder /app/frontend/package.json ./frontend/package.json
COPY --from=frontend-builder /app/frontend/node_modules ./frontend/node_modules

# Set the working directory to backend
WORKDIR /app/backend

# Expose the port the app runs on
EXPOSE 80

# Start the backend server
CMD ["node", "dist/app.js"]