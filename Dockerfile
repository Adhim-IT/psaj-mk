FROM node:22-alpine AS builder

# Add Maintainer Info
LABEL maintainer="muhammadluthfi059@gmail.com"

RUN apk add --no-cache libc6-compat

RUN mkdir /app
ADD . /app/

WORKDIR /app


RUN yarn install
RUN yarn next telemetry disable
RUN yarn build

FROM node:22-alpine
WORKDIR /app

RUN apk add --no-cache tzdata
ENV TZ Asia/Jakarta

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder  /app/.next/standalone   ./
COPY --from=builder  /app/.next/static       ./.next/static
COPY --from=builder  /app/public             ./public

USER nextjs

EXPOSE 3001

CMD ["node", "server.js"]