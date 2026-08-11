# ---------- Base ----------
FROM node:20-alpine AS base

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci


COPY . .

# prisma generate does not connect to the DB; placeholder URL satisfies prisma.config.ts
ENV DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build
RUN npm run prisma:generate

RUN npm run build

RUN mkdir -p /app/uploads /app/logs \
    && addgroup -S app && adduser -S app -G app \
    && chown -R app:app /app
USER app

EXPOSE 3001
CMD ["node", "dist/server.js"]