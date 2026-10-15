# WG Admin — веб-админка WireGuard

Веб-интерфейс админки WireGuard VPN: ноды с агентами, интерфейсы и пиры, точки
подключения и релеи, пробросы портов, прокси (SOCKS5 через mTLS), живая статистика,
пользователи, роли и журнал. Работает с бэкендом
[wg-admin-api](https://github.com/epifanovmd/wg-admin-api) (HTTP API и
Socket.IO).

Как пользоваться админкой — [docs/USER-GUIDE.md](docs/USER-GUIDE.md).

## Стек

- TypeScript, React 19, Vite 8
- MobX 6 (состояние), Inversify 8 (DI)
- Axios + orval (HTTP-клиент по OpenAPI)
- TanStack Router (файловый роутинг), Tailwind CSS 4
- Socket.IO (события реального времени)
- React Hook Form + Zod, Vitest + Testing Library

## Архитектура

Проект построен по методологии
**[Feature-Sliced Design](https://feature-sliced.design)**:
`app → pages → widgets → features → entities → shared`.

```
src/
  app/        ← композиционный корень (точка входа, роутер, DI-модули, глобальные стили)
  pages/      ← экраны — тонкая композиция widgets/features/entities под маршрут
  widgets/    ← крупные самостоятельные блоки UI
  features/   ← пользовательские сценарии и действия
  entities/   ← бизнес-сущности: состояние, доменные модели, представление
  shared/     ← переиспользуемый код без знания о бизнес-логике
    ui/       ←   UI-кит
    api/      ←   HTTP-клиент и сгенерированные контракты
    config/   ←   конфигурация окружения
    lib/      ←   независимые технические модули (DI, async-состояние, транспорт, хранилище, тема, уведомления, утилиты)
```

Документация:

- архитектурная модель, слои, границы и правила зависимостей — [ARCHITECTURE.md](ARCHITECTURE.md);
- памятка «что куда класть» — [FSD-CHEATSHEET.md](FSD-CHEATSHEET.md);
- правила написания кода — [CONVENTIONS.md](CONVENTIONS.md);
- принципы проектирования — [CLEAN-CODE.md](CLEAN-CODE.md) и [DESIGN-PRINCIPLES.md](DESIGN-PRINCIPLES.md).

## Требования

- Node.js >= 22.12.0
- Yarn 1 (>= 1.22.18)
- запущенный бэкенд `wg-admin-api` (локально — `http://localhost:8182`)
- Docker — для `make local-*`

## Быстрый старт

```sh
git clone <repository-url>
cd <project-directory>
yarn
cp .env.example .env.development
yarn dev            # http://localhost:3001
```

## Порты и окружение

| Что                                     | Адрес                   |
| --------------------------------------- | ----------------------- |
| бэкенд `wg-admin-api` (API и Socket.IO) | `http://localhost:8182` |
| `yarn dev` — dev-сервер Vite            | `http://localhost:3001` |
| `make local-up` — сборка в Docker       | `http://localhost:4175` |

Настройки — файлы `.env.*` вне git (образцы — `*.example`). `VITE_*` встраиваются в
статику при сборке.

- `.env.development` — `yarn dev`: адрес бэкенда `VITE_BASE_URL` и `VITE_SOCKET_BASE_URL`
  (цели прокси `/api` и `/socket.io`: браузер ходит на сам dev-сервер, CORS не нужен),
  хост и порт dev-сервера `VITE_HOST` / `VITE_PORT`. Без них — бэкенд
  `http://localhost:8182` и порт 3001;
- `.env.development.local` — необязательные локальные переопределения поверх него
  (например, другой бэкенд);
- `.env.docker` — сборка `make local-up` (создаётся из `.env.docker.example`);
- `.env.production` — сборка для сервера (на хост кладёт `make env` или CI).

## Команды

Все команды — из корня репозитория.

**Разработка и сборка**

| Команда                       | Что делает                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------ |
| `yarn dev`                    | dev-сервер Vite с горячей перезагрузкой                                        |
| `yarn build`                  | production-сборка в `dist/` (другой env — `yarn build --mode <mode>`)          |
| `yarn preview` (`yarn prod`)  | локальный предпросмотр сборки из `dist/`                                       |
| `yarn generate`               | HTTP-клиент и типы из OpenAPI бэкенда (`generate:orval`, `src/shared/api/gen`) |
| `yarn check-packages-updates` | устаревшие зависимости                                                         |

**Проверки**

| Команда                        | Что делает                                                         |
| ------------------------------ | ------------------------------------------------------------------ |
| `yarn verify`                  | всё перед merge: lint, typecheck, тесты и сборка                   |
| `yarn lint` / `lint:fix`       | ESLint, включая границы слоёв FSD / с автоисправлением             |
| `yarn format` / `format:check` | Prettier по проекту (исключения — `.prettierignore`, `.gitignore`) |
| `yarn typecheck`               | проверка типов: приложение и конфиги сборки                        |
| `yarn test`                    | тесты (Vitest)                                                     |
| `yarn test:dev`                | тесты в режиме watch                                               |
| `yarn test:coverage`           | тесты с отчётом покрытия                                           |

**Makefile** — Docker и деплой; список целей — `make help`.

| Команда                                       | Что делает                                                           |
| --------------------------------------------- | -------------------------------------------------------------------- |
| `make local-up`                               | production-сборка в Docker на этой машине (`.env.docker`, порт 4175) |
| `make local-ps` / `local-logs` / `local-down` | состояние / журнал / остановить                                      |
| `make deploy`                                 | исходники на хост, сборка образа там же, запуск (`sync build up`)    |
| `make env`                                    | env-файл сборки для сервера (`ENV_FILE`) на хост                     |
| `make sync` / `build` / `up` / `down`         | исходники на хост / собрать образ / запустить / остановить           |
| `make status` / `logs` / `restart`            | состояние / журнал / перезапуск на хосте                             |

Цели `local-*` и `help` работают без `.env.deploy`; остальные требуют его (образец —
`.env.deploy.example`), любое значение переопределяется в команде:
`make deploy SSH_HOST=…`.

## Сборка

```sh
yarn build          # статика в dist/ (VITE_* — из .env.production)
yarn preview        # локальный предпросмотр
make local-up       # то же в Docker с nginx: http://localhost:4175
```

Режим сборки (`--mode`, он же файл `.env.[mode]`) в образе задаёт аргумент
`BUILD_MODE`: на сервере — `production`, у `make local-up` — `docker`. Версия сборки
(тег или SHA, коммит, время) — из переменных `APP_VERSION`, `APP_COMMIT`,
`APP_BUILT_AT` (их передаёт make), без них — версия из `package.json`
(`WEB_BUILD` в `@shared/config/env`).

## Генерация API-клиента

HTTP-клиент и типы в `src/shared/api/gen/` генерируются orval из OpenAPI-спецификации
бэкенда и **не редактируются вручную**. По умолчанию спецификация берётся из соседнего
репозитория (`../wg-admin-api/src/routing/swagger.json`); путь или URL — переменная
`MAIN_SWAGGER`:

```sh
yarn generate
MAIN_SWAGGER=http://localhost:8182/api-docs/swagger.json yarn generate
```

Дерево маршрутов `src/app/routeTree.gen.ts` генерирует плагин TanStack Router — тоже
не редактируется вручную.

## Проверки

```sh
yarn verify          # lint + typecheck + test + build
yarn test:coverage   # с порогом покрытия холдеров (100%)
yarn format:check
```

Git-хуки (lefthook): на коммит — eslint и prettier по изменённым файлам, на push —
typecheck и тесты. CI (GitHub Actions, workflow `CI`) на pull request и push в `main` —
lint, typecheck, тесты и сборка.

## Деплой

`Dockerfile` собирает статику и отдаёт её nginx (`nginx.conf`: SPA-fallback на
`index.html`, долгий кэш `/assets`).

Деплой по SSH — исходники на хост (rsync, исключения — `.deployignore`) и сборка там же:

```sh
cp .env.deploy.example .env.deploy   # хост, каталог, порт (файл не в git)
make env                             # .env.production (ENV_FILE) на хост
make deploy                          # sync → build → up
make status | logs | restart | down
```

Версию сборки make берёт из git этой копии (`git describe`, коммит, время) и передаёт в
образ аргументами сборки. `up` запускается с `--remove-orphans`.

GitHub Actions: после проверок на push в `main` workflow `CI` вызывает `Deploy`
(вручную — только с `main`), и тот выполняет sync, env, build и up. Нужны переменная
репозитория `DEPLOY_ENV` — содержимое `.env.deploy` — и секрет `SSH_PRIVATE_KEY`. Адрес
API для сборки — секрет `PRODUCTION_ENV` (содержимое `.env.production`): кладётся на
хост при каждом деплое; без него используется файл, уже лежащий на хосте (`make env`).

## Лицензия

MIT
