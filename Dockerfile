# Сборка статики и раздача nginx. Адрес API и прочие VITE_* встраиваются при
# сборке из .env.production (на хост кладёт `make env` или деплой из CI).
ARG NODE_VERSION=22-alpine

FROM node:${NODE_VERSION} AS deps
# Без install-скриптов: git-хуки (lefthook) в образе не нужны и без git падают.
WORKDIR /app
COPY package.json yarn.lock ./
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn,sharing=locked \
    yarn install --frozen-lockfile --non-interactive --ignore-scripts --network-timeout 600000

FROM node:${NODE_VERSION} AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Версия сборки (подпись версий в админке) — из make: git describe, коммит, время.
ARG APP_VERSION=""
ARG APP_COMMIT=""
ARG APP_BUILT_AT=""
RUN APP_VERSION=$APP_VERSION APP_COMMIT=$APP_COMMIT APP_BUILT_AT=$APP_BUILT_AT yarn build

FROM nginx:1.27-alpine AS runner
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
