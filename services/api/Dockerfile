FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package files e instalar todas las dependencias (incluyendo dev)
COPY package*.json ./
RUN npm install

# Copiar código fuente y compilar TypeScript
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:18-alpine

WORKDIR /app

# Solo dependencias de producción
COPY package*.json ./
RUN npm install --omit=dev

# Copiar el código compilado desde la etapa de build
COPY --from=builder /app/dist ./dist

# Puerto donde escucha la API
EXPOSE 8080

# Comando de inicio
CMD ["node", "dist/index.js"]