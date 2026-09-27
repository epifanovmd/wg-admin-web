import type { WgSocksServiceDto } from "@shared/api/gen/main/model";

/** Локальный порт клиента stunnel на Mac (как в install.sh по умолчанию). */
export const LOCAL_SOCKS_PORT = 1080;

export interface ISocksSecret {
  serviceName: string;
  username: string;
  password: string;
}

/** Ссылка tg://socks на локальный клиент stunnel. */
export const telegramSocksLink = (secret: ISocksSecret): string =>
  `tg://socks?server=127.0.0.1&port=${LOCAL_SOCKS_PORT}` +
  `&user=${encodeURIComponent(secret.username)}` +
  `&pass=${encodeURIComponent(secret.password)}`;

/**
 * Имя архива — как у бэкенда в Content-Disposition (заголовки ответа
 * API-клиент не отдаёт).
 */
export const macClientFileName = (name: string): string =>
  `${
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "proxy"
  }-mac.zip`;

/** Адрес, по которому к прокси подключаются клиенты. */
export const socksClientAddress = (service: WgSocksServiceDto): string =>
  `${service.clientHost ?? service.nodeHost ?? "—"}:${
    service.clientPort ?? service.listenPort
  }`;
