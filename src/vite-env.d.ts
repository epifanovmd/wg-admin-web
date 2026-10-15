/** Переменные окружения клиента (`.env.[mode]`, поверх — `.env.[mode].local`). */
interface ImportMetaEnv {
  /** Адрес API: цель прокси `/api` dev-сервера, базовый URL запросов в сборке. */
  readonly VITE_BASE_URL: string;
  /** Адрес Socket.IO: цель прокси `/socket.io` dev-сервера, адрес сокета в сборке. */
  readonly VITE_SOCKET_BASE_URL: string;
  readonly VITE_APP_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** Версия сборки фронта (`define` в vite.config): тег или SHA, иначе package.json. */
declare const __APP_VERSION__: string;
/** Короткий SHA коммита сборки; пусто — вне сборки образа. */
declare const __APP_COMMIT__: string;
/** Время сборки (ISO 8601); пусто — вне сборки образа. */
declare const __APP_BUILT_AT__: string;
