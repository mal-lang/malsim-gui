# Stage 1: build Angular
FROM node:22 AS build
WORKDIR /app
COPY package*.json ./
COPY tsconfig*.json ./
RUN npm ci
RUN npm install -g @angular/cli
COPY . .
RUN ng build --base-href /dashboard/ --output-path api/frontend

# Stage 2: FastAPI runtime
FROM python:3.11-slim
WORKDIR /app

# Install backend dependencies
COPY api/ /app/api/
RUN pip install --no-cache-dir -r /app/api/requirements.txt

# Copy built Angular app into FastAPI static/frontend
COPY --from=build /app/api/frontend /app/api/frontend

EXPOSE 8888
CMD ["uvicorn", "api.app:mal_app", "--host", "0.0.0.0", "--port", "8888"]
