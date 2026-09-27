import { describeUserAgent } from "@shared/lib/utils";

/**
 * Имя и тип устройства для сессии на сервере: он берёт их из заголовков при
 * входе. Значение заголовка — только печатный ASCII.
 */
export const deviceHeaders = (
  userAgent: string = navigator.userAgent,
): Record<string, string> => ({
  "X-Device-Name": describeUserAgent(userAgent).replace(/[^\x20-\x7e]/g, ""),
  "X-Device-Type": "web",
});
