FROM node:25-alpine AS base

WORKDIR /app
RUN npm i -g pnpm
COPY pnpm-lock.yaml ./
RUN pnpm fetch

COPY . .

RUN npm i -g turbo

FROM base AS build-server

WORKDIR /app

RUN pnpm i -r --offline --filter="node-socketio-cluster-server"
RUN pnpm turbo build --filter="node-socketio-cluster-server"

RUN rm -rf ./node_modules
RUN rm -rf ./server/node_modules
RUN pnpm i -r --offline --prod --filter="node-socketio-cluster-server"

FROM node:25-alpine AS deploy-server

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build-server /app/node_modules/ ./node_modules
COPY --from=build-server /app/server/node_modules ./server/node_modules
COPY --from=build-server /app/server/dist ./server/dist

CMD ["node", "server/dist/index.js"]

FROM base AS build-client

WORKDIR /app

RUN pnpm i -r --offline --filter="node-socketio-cluster-client"
RUN pnpm turbo build --filter="node-socketio-cluster-client"

FROM nginx:1.29.4-alpine-slim AS deploy-client

WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=build-client /app/client/dist .
ENTRYPOINT [ "nginx", "-g", "daemon off;" ]