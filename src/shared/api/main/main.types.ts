import { createInjectDecorator } from "@shared/lib/di";
import type { IHttpClient } from "@shared/lib/http";

import type { getWgAdmin } from "../gen/main/api";

/** Клиент основного бэкенда: тосты, гонка запросов, bearer-авторизация. */
export const IMainHttpClient =
  createInjectDecorator<IHttpClient>("IMainHttpClient");

/** Сгенерированный orval клиент основного бэкенда. */
export type IMainApi = ReturnType<typeof getWgAdmin>;
export const IMainApi = createInjectDecorator<IMainApi>("IMainApi");
