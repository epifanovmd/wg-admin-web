import { INotificationService } from "@shared/lib/notifications/notification.types";
import type { ITokenSession } from "@shared/lib/session";
import { ITokenProvider } from "@shared/lib/socket/contract";
import { IStorageService } from "@shared/lib/storage";
import { Container } from "inversify";

import { apiModule } from "../api.module";
import { IMainApi, IMainHttpClient, IMainSession } from "../main";

const createStorage = (): IStorageService => {
  const map = new Map<string, string>();

  return {
    getItem: key => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: key => {
      map.delete(key);
    },
  };
};

const createContainer = (storage: IStorageService = createStorage()) => {
  const container = new Container();

  container.load(apiModule);
  container.bind(IStorageService.Tid).toConstantValue(storage);
  container
    .bind(INotificationService.Tid)
    .toConstantValue({ error: vi.fn() } as unknown as INotificationService);

  return container;
};

describe("регистрация бэкендов", () => {
  it("бэкенд собирается целиком: сессия, клиент, API", () => {
    const container = createContainer();

    expect(container.get(IMainSession.Tid)).toBeDefined();
    expect(container.get(IMainHttpClient.Tid)).toBeDefined();
    expect(container.get(IMainApi.Tid)).toBeDefined();
  });

  it("сокет получает сессию основного бэкенда", () => {
    const container = createContainer();

    expect(container.get(ITokenProvider.Tid)).toBe(
      container.get(IMainSession.Tid),
    );
  });

  it("сессии и клиенты — синглтоны", () => {
    const container = createContainer();

    expect(container.get(IMainSession.Tid)).toBe(
      container.get(IMainSession.Tid),
    );
    expect(container.get(IMainHttpClient.Tid)).toBe(
      container.get(IMainHttpClient.Tid),
    );
  });

  it("сессия основного бэкенда переживает перезапуск", () => {
    const storage = createStorage();
    const tokens = { accessToken: "a", refreshToken: "r" };

    createContainer(storage)
      .get<ITokenSession>(IMainSession.Tid)
      .setTokens(tokens);

    const restored = createContainer(storage);

    // access-токен намеренно не сохраняется: он восстанавливается обновлением.
    expect(restored.get<ITokenSession>(IMainSession.Tid).tokens).toEqual({
      accessToken: "",
      refreshToken: "r",
    });
  });
});
