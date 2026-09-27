import { createInjectDecorator } from "@shared/lib/di";
import {
  CrossTabTokenStorage,
  ITokenSession,
  PersistentTokenStorage,
  TokenSession,
} from "@shared/lib/session";
import type { IStorageService } from "@shared/lib/storage";

import type { IMainAuthApi } from "./main-auth.api";

/** DI-токен сессии основного бэкенда; её же получает сокет. */
export const IMainSession = createInjectDecorator<ITokenSession>();

const REFRESH_TOKEN_KEY = "app:refresh_token";
/** Канал, по которому вкладки делятся полной парой токенов в памяти. */
const TOKENS_CHANNEL = "app:tokens";
/** Общая блокировка вкладок на время обновления. */
const REFRESH_LOCK = "app:token-refresh";

/** Запас до истечения access-токена, при котором пора обновляться. */
const REFRESH_BUFFER_SECONDS = 60;

/**
 * Сессия основного бэкенда: refresh-токен переживает перезапуск, access живёт
 * в памяти и обновляется заранее по `expiresIn` из ответа. Вкладки делятся
 * парой через канал и обновляют её под общей блокировкой; вход, обновление и
 * выход в одной вкладке доходят до остальных. Доменное состояние авторизации
 * живёт в `entities/auth`.
 */
export const createMainSession = (
  api: IMainAuthApi,
  storage: IStorageService,
): ITokenSession =>
  new TokenSession({
    storage: new CrossTabTokenStorage(
      new PersistentTokenStorage(storage, { key: REFRESH_TOKEN_KEY }),
      { keys: [REFRESH_TOKEN_KEY], channel: TOKENS_CHANNEL },
    ),
    refreshBufferSeconds: REFRESH_BUFFER_SECONDS,
    lockName: REFRESH_LOCK,
    refresh: async refreshToken => {
      const { data, error } = await api.refresh(refreshToken);

      if (error) throw error;

      return data;
    },
  });
