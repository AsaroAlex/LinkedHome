# syntax=docker/dockerfile:1
FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --strict-ssl=true
COPY . .
RUN npm run build

FROM node:24-bookworm-slim AS runtime-dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --strict-ssl=true

FROM node:24-bookworm-slim AS runtime
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000
WORKDIR /app
COPY --from=runtime-dependencies --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/package.json /app/package-lock.json ./
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/server ./server
COPY --from=build --chown=node:node /app/src/brand.ts ./src/brand.ts
COPY --from=build --chown=node:node /app/scripts/migrate.ts /app/scripts/maintenance.ts /app/scripts/deploy-check.ts ./scripts/
COPY --from=build --chown=node:node /app/migrations ./migrations
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=6s --start-period=20s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health',{signal:AbortSignal.timeout(5000)}).then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["npm", "start"]
