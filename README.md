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
- запущенный бэкенд (по умолчанию `http://localhost:8181`)

## Запуск

```sh
git clone <repository-url>
cd <project-directory>
yarn
yarn dev            # http://localhost:3000
```

Настройки окружения:

- `.env.development` — значения по умолчанию для разработки (в git): адрес бэкенда
  `VITE_BASE_URL` (цель прокси `/api` dev-сервера), адрес Socket.IO
  `VITE_SOCKET_BASE_URL`, порт dev-сервера;
- `.env.development.local` — свои переопределения (не в git), например адрес
  удалённого бэкенда.

## Сборка

```sh
yarn build          # статика в dist/
yarn prod           # локальный предпросмотр прод-сборки
```

`VITE_*` встраиваются при сборке: `.env.production` (значения по умолчанию), поверх —
`.env.production.local` с адресом API конкретного сервера (не в git).

## Генерация API-клиента

HTTP-клиент и типы в `src/shared/api/gen/` генерируются orval из OpenAPI-спецификации
бэкенда и **не редактируются вручную**. По умолчанию спецификация берётся из соседнего
репозитория бэкенда (`../wg-admin-api/src/routing/swagger.json`); путь или URL
задаётся переменной `MAIN_SWAGGER`:

```sh
yarn generate:orval
MAIN_SWAGGER=../wg-admin-api/src/routing/swagger.json yarn generate:orval
MAIN_SWAGGER=http://localhost:8181/api-docs/swagger.json yarn generate:orval
```

Дерево маршрутов `src/app/routeTree.gen.ts` генерирует плагин TanStack Router — тоже
не редактируется вручную.

## Проверки

```sh
yarn lint            # eslint, включая границы слоёв FSD — 0 ошибок
yarn typecheck       # tsc: приложение и конфиги сборки
yarn test            # vitest run
yarn test:coverage   # с порогом покрытия холдеров (100%)
yarn build
```

Git-хуки (lefthook): на коммит — eslint и prettier по изменённым файлам, на push —
typecheck и тесты. В CI (GitHub Actions, workflow `Verify`) на pull request и
push в `main` — lint, typecheck, тесты и сборка.

Автофиксы:

```sh
yarn lint:fix
yarn prettier:fix
```

## Деплой

`Dockerfile` собирает статику и отдаёт её nginx (`nginx.conf`: SPA-fallback на
`index.html`, долгий кэш `/assets`).

Деплой по SSH — исходники на хост (rsync, исключения — `.deployignore`) и сборка там же:

```sh
cp .env.deploy.example .env.deploy   # хост, каталог, порт (файл не в git)
make env                             # один раз: .env.production.local на хост
make deploy                          # sync → build → up
make status | logs | restart | down
make local-up | local-down | local-logs   # то же на этой машине, без .env.deploy
```

Любое значение из `.env.deploy` переопределяется в команде: `make deploy SSH_HOST=…`.
`up` запускается с `--remove-orphans`: контейнеры прежних имён сервиса в том же
compose-проекте удаляются.

GitHub Actions: workflow `Deploy` запускается после успешного `Verify` на push в `main`
(или вручную, только с `main`) и выполняет `make deploy`. Нужны переменная репозитория `DEPLOY_ENV` —
содержимое `.env.deploy` (хост, каталог на хосте, порт) — и секрет `SSH_PRIVATE_KEY`.
Адрес API для сборки берётся из `.env.production.local` на хосте (`make env`).

## Лицензия

MIT
