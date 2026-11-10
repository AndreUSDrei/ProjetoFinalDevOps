FROM node:22-bookworm-slim
WORKDIR /app
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev
COPY server/src ./src
COPY src/data ./seed
ENV NODE_ENV=production
ENV PORT=3001
ENV DATABASE_PATH=/data/app.db
ENV SEED_DIR=/app/seed
ENV LOG_LEVEL=info
ENV NODE_OPTIONS=--experimental-sqlite
RUN mkdir -p /data && chown -R node:node /app /data
USER node
EXPOSE 3001
CMD ["node", "src/index.js"]
