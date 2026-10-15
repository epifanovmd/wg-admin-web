const env = import.meta.env;

/**
 * В dev API и Socket.IO идут на сам dev-сервер: его прокси `/api` и `/socket.io`
 * ведут на VITE_BASE_URL и VITE_SOCKET_BASE_URL. В сборке — адреса из env.
 */
export const BASE_URL = env.DEV ? window.location.origin : env.VITE_BASE_URL;
export const SOCKET_BASE_URL = env.DEV
  ? window.location.origin
  : env.VITE_SOCKET_BASE_URL;
export const APP_NAME = env.VITE_APP_NAME;

/** Сборка фронта: версия (тег или SHA), коммит и время; вне образа — только версия. */
export const WEB_BUILD = {
  version: __APP_VERSION__,
  commit: __APP_COMMIT__ || null,
  builtAt: __APP_BUILT_AT__ || null,
};
