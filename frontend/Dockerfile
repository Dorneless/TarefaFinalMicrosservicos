# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Pass env vars at build time or ensure they are read at runtime (Next.js public vars need to be baked in or handled specially)
# For simplicity with docker-compose, we often rely on runtime or build args.
# Here we just build.
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
# Copy next.config.ts if it exists/needed, usually baked into .next
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "start"]
