const env = import.meta.env;

/** В dev запросы идут на сам dev-сервер, его прокси `/api` ведёт на VITE_BASE_URL. */
export const BASE_URL = env.DEV ? window.location.origin : env.VITE_BASE_URL;
export const SOCKET_BASE_URL = env.VITE_SOCKET_BASE_URL;
export const APP_NAME = env.VITE_APP_NAME;
