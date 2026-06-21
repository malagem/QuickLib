# node:sqlite is built-in since Node 24 — no native compilation needed
FROM node:24-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY src/    ./src/
COPY public/ ./public/

ENV PORT=9095
ENV NODE_ENV=production
ENV NODE_NO_WARNINGS=1

EXPOSE 9095

RUN mkdir -p /app/data && chown node:node /app/data

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:9095/health',r=>{process.exit(r.statusCode===200?0:1)})"

USER node
CMD ["node", "src/app.js"]
