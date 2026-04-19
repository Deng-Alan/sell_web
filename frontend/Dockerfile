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

COPY --from=builder /app/public ./frontend/public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./frontend/.next/static

COPY --from=builder /app/public ./app/public
COPY --from=builder /app/.next/static ./app/.next/static

WORKDIR /app/app

EXPOSE 3000

CMD ["node", "server.js"]
