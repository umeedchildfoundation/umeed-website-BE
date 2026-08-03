# ---------- Base ----------
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl

# ---------- Dependencies (with devDependencies, needed to build) ----------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---------- Build ----------
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# ---------- Production dependencies only ----------
FROM base AS prod-deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---------- Runtime ----------
FROM base AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package.json ./

# Generate the Prisma client into the production node_modules
RUN npx prisma generate

RUN mkdir -p /app/uploads /app/logs \
    && addgroup -S app && adduser -S app -G app \
    && chown -R app:app /app
USER app

EXPOSE 3001

CMD ["node", "dist/server.js"]
