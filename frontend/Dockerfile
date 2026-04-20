FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN mkdir -p public

ARG NEXT_PUBLIC_API_BASE_URL=/api
ARG INTERNAL_API_BASE_URL=http://backend:8080/api
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV INTERNAL_API_BASE_URL=${INTERNAL_API_BASE_URL}

RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

ARG NEXT_PUBLIC_API_BASE_URL=/api
ARG INTERNAL_API_BASE_URL=http://backend:8080/api
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV INTERNAL_API_BASE_URL=${INTERNAL_API_BASE_URL}

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public /tmp/public
COPY --from=builder /app/.next/static /tmp/static

RUN set -eux; \
    APP_DIR="$(find /app -maxdepth 2 -type f -name server.js -exec dirname {} \; | head -n 1)"; \
    test -n "$APP_DIR"; \
    mkdir -p "$APP_DIR/public" "$APP_DIR/.next/static"; \
    cp -r /tmp/public/. "$APP_DIR/public/"; \
    cp -r /tmp/static/. "$APP_DIR/.next/static/"; \
    echo "$APP_DIR" > /app/.appdir

EXPOSE 3000

CMD ["sh", "-c", "cd \"$(cat /app/.appdir)\" && exec node server.js"]
