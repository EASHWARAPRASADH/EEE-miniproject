# --- Stage 1: Build Frontend ---
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Stage 2: Final Image ---
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# Copy backend and built frontend
COPY backend/ ./backend/
COPY --from=builder /app/dist/ ./dist/

# Install Python dependencies
WORKDIR /app/backend
RUN pip install --no-cache-dir -r requirements-prod.txt

# Create cache directory for Hugging Face
RUN mkdir -p /app/backend/cache && chmod 777 /app/backend/cache
ENV TORCH_HOME=/app/backend/cache

EXPOSE 7860

# Run the app
CMD ["python", "app.py"]
