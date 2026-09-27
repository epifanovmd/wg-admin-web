# CLAUDE.md

## Язык ответа

Отвечать на русском.

## Проект

WG Admin — веб-админка WireGuard VPN (бэкенд — соседний репозиторий
`wg-admin-api`). React 19 + Vite 8 + TypeScript, MobX 6 + Inversify 8 (DI), TanStack Router (файловый роутинг), Tailwind CSS 4, Socket.IO, RHF + Zod, orval (API codegen), Vitest.

## Команды

```sh
yarn dev            # dev server :3000
yarn typecheck      # tsc: приложение + конфиги сборки (tsconfig.node.json)
yarn lint / lint:fix
yarn test           # vitest run (watch: test:dev, coverage: test:coverage)
yarn build
yarn generate:orval # регенерация src/shared/api/gen/ (MAIN_SWAGGER — путь/URL спецификации)
```

Перед merge обязательны: lint + typecheck + test + build. Хуки lefthook: на коммит —
eslint и prettier по изменённым файлам, на push — typecheck и тесты; CI (`Verify`) —
всё вместе со сборкой.

## Никогда не редактировать вручную

- `src/shared/api/gen/` — orval codegen
- `src/app/routeTree.gen.ts` — TanStack Router plugin

## Документация

Проектная документация (`README.md`, `ARCHITECTURE.md`, `FSD-CHEATSHEET.md`,
`CONVENTIONS.md`, `CLEAN-CODE.md`, `DESIGN-PRINCIPLES.md`) описывает **общие принципы,
архитектуру и структуру** — без описания конкретных слайсов, модулей и имён.

**Эти документы меняются только в исключительных случаях** — когда в проекте
действительно меняется архитектура, принцип, паттерн или правило. Правка задачи, даже
изменившая архитектурный факт, не повод править документ попутно: сообщить об этом и
вынести правку документации в отдельную задачу. Не добавлять в них проектную конкретику
(имена слайсов, компонентов, сторов, файлов).

Локальная память `.claude/memory/` — наоборот, живой справочник: её можно и нужно
обновлять без ограничений при каждой задаче — проверенные факты, gotcha, точные
файловые карты.

## Где что читать

| Вопрос                                                    | Документ                                                                     |
| --------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Слои FSD, границы импортов, public API, DI, автопроверки  | [ARCHITECTURE.md](ARCHITECTURE.md)                                           |
| Куда положить новый код (decision tree)                   | [FSD-CHEATSHEET.md](FSD-CHEATSHEET.md)                                       |
| Именование файлов, компоненты, импорты, типы, хуки, тесты | [CONVENTIONS.md](CONVENTIONS.md)                                             |
| Clean code, SOLID, паттерны                               | [CLEAN-CODE.md](CLEAN-CODE.md), [DESIGN-PRINCIPLES.md](DESIGN-PRINCIPLES.md) |
| Compound slots API                                        | [src/shared/lib/slots/README.md](src/shared/lib/slots/README.md)             |

Конкретика проекта (проверенные факты, gotcha, точные файловые карты) — не в корневых
документах, а в [.claude/memory/MEMORY.md](.claude/memory/MEMORY.md): architecture,
aliases, build, auth, holders, ui, routing, testing, patterns. Загружай тематический
файл, когда работаешь в соответствующей области.

## Минимум, который надо знать всегда

- FSD: `app → pages → widgets → features → entities → shared`; импорты только вниз, слайсы одного слоя не видят друг друга (eslint-plugin-boundaries, 0 ошибок обязательны). Внутри слайса — только относительные пути (self-import через alias запрещён).
- DI: сторы — singleton, `IXxx.useInstance()` в React / `IXxx.getInstance()` вне React; биндинги в `<slice>.module.ts`, регистрация в `src/app/app.module.ts`. Обёрточных хуков нет.
- Async-состояние — только через холдеры `@shared/lib/holders` (TanStack-Query-like: useEntity/useCollection/usePaged/useInfinite/useMutation/usePolling), не ручной useState/useEffect-fetch.
- Все API-вызовы возвращают `{ data } | { error }`, исключения наружу не кидаются.
- Сокет в моделях — хуки `useSocketRoom`/`useSocketEvent` (`@shared/lib/socket`), не
  ручной `useEffect` с отключённым exhaustive-deps.
- Страницы: VM на уровне страницы, `PermissionGate` внутри `PageLayout`, загрузка
  только с правом просмотра; модалки форм получают `vm` и своих кнопок не рисуют.
- `shared/lib/holders` покрыт тестами на 100% (порог в vitest.config.ts) — правка холдеров без тестов роняет coverage.
- Формы: React Hook Form + zodResolver; общие валидации — в `entities/auth`.
- **Все функции — стрелочные.** `function`-объявления и выражения запрещены (компоненты,
  хуки, хелперы, type guards, фабрики, callback-и); методы классов остаются методами.
  Хелпер объявляется выше первого использования — у `const` нет hoisting. Дженерик в
  `.tsx` — `<T,>`. Проверяется линтером (`func-style`, `prefer-arrow-callback`).
- **Багфикс через тест.** Сначала тест, воспроизводящий баг и падающий на текущем коде →
  правка → зелёный прогон. Тест остаётся в кодовой базе.

## Workflow

Любая задача (фича, баг, рефакторинг) проходит четыре этапа:

1. **Анализ** — прочитать релевантные файлы `.claude/memory/` и затрагиваемый код,
   определить scope слайсов и файлов, выявить риски и edge cases.
2. **План** — пошаговый план с конкретными файлами, разбитый на мелкие итерации
   (каждая — рабочее состояние). Показать пользователю, дождаться подтверждения.
3. **Выполнение** — по одной итерации; после каждой — lint и typecheck; не переходить
   дальше, пока текущая не стабильна. Сообщать прогресс.
4. **Проверка** — `yarn lint`, `yarn typecheck`, `yarn test`, `yarn build`; краткое резюме.

## Комментарии в коде

- Разрешены только: JSDoc/краткий комментарий к пропсам, определениям функций,
  компонентов и хуков.
- В теле функций — только если место неочевидное и без комментария нельзя.
- Комментарий — краткий, по факту. Не описывать историю изменений.
- Если комментарий устарел — переписать заново, а не дополнять.
