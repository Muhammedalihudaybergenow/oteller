FROM node:20-alpine as builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/

# Copy source files
COPY nx.json tsconfig.base.json ./
COPY apps/api ./apps/api
COPY libs ./libs

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the app
RUN pnpm nx build api

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built assets from builder
COPY --from=builder /app/dist/apps/api ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main.js"]

