/** Переменные окружения клиента (`.env.[mode]`, поверх — `.env.[mode].local`). */
interface ImportMetaEnv {
  /** Адрес API: цель прокси dev-сервера, базовый URL запросов в production. */
  readonly VITE_BASE_URL: string;
  /** Адрес сервера Socket.IO. */
  readonly VITE_SOCKET_BASE_URL: string;
  readonly VITE_APP_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
