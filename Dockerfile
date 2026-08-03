# ---------- Base ----------
FROM node:20-alpine AS base

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci


COPY . .

RUN npm run prisma:generate

RUN npm run build

RUN mkdir -p /app/uploads /app/logs \
    && addgroup -S app && adduser -S app -G app \
    && chown -R app:app /app
USER app

EXPOSE 3001
CMD ["node", "dist/server.js"]