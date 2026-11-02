FROM node:25-alpine AS packages
WORKDIR /app/
RUN --mount=type=bind,target=/docker-context \
    cd /docker-context/; \
    find . -name "package.json" -mindepth 0 -maxdepth 4 -exec cp --parents "{}" /app/ \;

FROM node:25-alpine AS builder
RUN apk add --no-cache bash

WORKDIR /app
COPY --from=packages /app/ .
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1-alpine
COPY --from=builder --chown=nginx:nginx /app/_static /usr/share/nginx/html
EXPOSE 80