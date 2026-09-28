import type { ITokenSource } from "@shared/lib/http";

import type {
  ITokenSession,
  ITokenStorage,
  TokenGrant,
  TokenPair,
} from "../session.types";
import { MemoryTokenStorage } from "../storage/memory-token-storage";
import { TokenSession } from "../token-session";

const pair = (suffix: string): TokenPair => ({
  accessToken: `access-${suffix}`,
  refreshToken: `refresh-${suffix}`,
});

/** Ответ бэкенда со сроком жизни access-токена. */
const grant = (suffix: string, expiresIn = 900): TokenGrant => ({
  ...pair(suffix),
  expiresIn,
  sessionId: "s-1",
});

const createSession = (
  overrides: Partial<ConstructorParameters<typeof TokenSession>[0]> = {},
) => {
  const refresh = vi.fn(async (_token: string): Promise<TokenGrant> =>
    pair("2"),
  );
  const session = new TokenSession({ refresh, ...overrides });

  return { refresh, session };
};

const setVisibility = (state: DocumentVisibilityState) => {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    value: state,
  });
  document.dispatchEvent(new Event("visibilitychange"));
};

describe("TokenSession", () => {
  it("без токенов сессии нет", () => {
    const { session } = createSession();

    expect(session.accessToken).toBe("");
    expect(session.isAuthorized).toBe(false);
    expect(session.sessionId).toBeUndefined();
    expect(session.tokens).toEqual({ accessToken: "", refreshToken: "" });
  });

  it("setTokens кладёт пару в память и в хранилище, отбрасывая лишние поля", () => {
    const storage = new MemoryTokenStorage();
    const { session } = createSession({ storage });

    session.setTokens({ ...pair("1"), user: { id: 1 } } as TokenGrant);

    expect(session.tokens).toEqual(pair("1"));
    expect(storage.read()).toEqual(pair("1"));
    expect(session.isAuthorized).toBe(true);
  });

  it("срок и сессия приходят из ответа бэкенда: токен не разбирается", () => {
    vi.useFakeTimers({ now: 1_000_000 });
    const { session } = createSession({ refreshBufferSeconds: 60 });

    session.setTokens(grant("1", 900));

    expect(session.sessionId).toBe("s-1");
    expect(session.tokens.expiresAt).toBe(1_000_000 + 900_000);
    expect(session.tokens.refreshAt).toBe(1_000_000 + 840_000);
    vi.useRealTimers();
  });

  it("запас не больше половины срока: короткий токен не обновляется сразу", () => {
    vi.useFakeTimers({ now: 0 });
    const { session } = createSession({ refreshBufferSeconds: 60 });

    session.setTokens(grant("1", 30));

    expect(session.tokens.refreshAt).toBe(15_000);
    vi.useRealTimers();
  });

  it("конструктор поднимает токены из хранилища", () => {
    const storage = new MemoryTokenStorage();

    storage.write(pair("1"));

    expect(createSession({ storage }).session.tokens).toEqual(pair("1"));
  });

  it("clear чистит и память, и хранилище", () => {
    const storage = new MemoryTokenStorage();
    const { session } = createSession({ storage });

    session.setTokens(pair("1"));
    session.clear();

    expect(session.isAuthorized).toBe(false);
    expect(storage.read()).toBeNull();
  });

  it("refreshToken меняет пару через обработчик бэкенда", async () => {
    const { session, refresh } = createSession();

    session.setTokens(pair("1"));
    await session.refreshToken();

    expect(refresh).toHaveBeenCalledWith("refresh-1");
    expect(session.tokens).toEqual(pair("2"));
  });

  it("параллельные вызовы делят один refresh", async () => {
    const { session, refresh } = createSession();

    session.setTokens(pair("1"));
    await Promise.all([session.refreshToken(), session.refreshToken()]);

    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("следующий refresh после завершения предыдущего — новый вызов", async () => {
    const { session, refresh } = createSession();

    session.setTokens(pair("1"));
    await session.refreshToken();
    await session.refreshToken();

    expect(refresh).toHaveBeenCalledTimes(2);
  });

  it("ошибка refresh очищает сессию и поднимает onSessionExpired", async () => {
    const error = new Error("expired");
    const { session, refresh } = createSession();
    const onExpired = vi.fn();

    refresh.mockRejectedValue(error);
    session.onSessionExpired(onExpired);
    session.setTokens(pair("1"));

    await expect(session.refreshToken()).rejects.toBe(error);
    expect(session.isAuthorized).toBe(false);
    expect(onExpired).toHaveBeenCalledTimes(1);
  });

  it("временная ошибка refresh сессию не завершает", async () => {
    const error = new Error("offline");
    const { session, refresh } = createSession({
      isSessionRejected: () => false,
    });
    const onExpired = vi.fn();

    refresh.mockRejectedValue(error);
    session.onSessionExpired(onExpired);
    session.setTokens(pair("1"));

    await expect(session.refreshToken()).rejects.toBe(error);
    expect(session.tokens).toEqual(pair("1"));
    expect(onExpired).not.toHaveBeenCalled();
    session.dispose();
  });

  it("отказ бэкенда по предикату завершает сессию", async () => {
    const { session, refresh } = createSession({
      isSessionRejected: error => (error as Error).message === "401",
    });
    const onExpired = vi.fn();

    refresh.mockRejectedValue(new Error("401"));
    session.onSessionExpired(onExpired);
    session.setTokens(pair("1"));

    await expect(session.refreshToken()).rejects.toThrow("401");
    expect(session.isAuthorized).toBe(false);
    expect(onExpired).toHaveBeenCalledTimes(1);
  });

  it("refresh без токена бросает, но сессию протухшей не объявляет", async () => {
    const { session, refresh } = createSession();
    const onExpired = vi.fn();

    session.onSessionExpired(onExpired);

    await expect(session.refreshToken()).rejects.toThrow(
      "No refresh token available",
    );
    expect(refresh).not.toHaveBeenCalled();
    expect(onExpired).not.toHaveBeenCalled();
  });

  describe("ensureFreshToken", () => {
    it("без срока от бэкенда заранее не обновляет: остаётся реакция на 401", async () => {
      const { session, refresh } = createSession();

      session.setTokens(pair("1"));
      await session.ensureFreshToken();

      expect(refresh).not.toHaveBeenCalled();
    });

    it("свежий токен не трогает, на исходе срока — обновляет один раз", async () => {
      vi.useFakeTimers({ now: 0 });
      const { session, refresh } = createSession({ autoRefresh: false });

      session.setTokens(grant("1", 900));
      await Promise.all([
        session.ensureFreshToken(),
        session.ensureFreshToken(),
      ]);
      expect(refresh).not.toHaveBeenCalled();

      vi.setSystemTime(840_000);
      await Promise.all([
        session.ensureFreshToken(),
        session.ensureFreshToken(),
      ]);
      expect(refresh).toHaveBeenCalledTimes(1);
      vi.useRealTimers();
    });

    it("есть refresh-токен, но нет access — обновляет", async () => {
      const storage = new MemoryTokenStorage();

      storage.write({ accessToken: "", refreshToken: "refresh-1" });
      const { session, refresh } = createSession({ storage });

      await session.ensureFreshToken();

      expect(refresh).toHaveBeenCalledWith("refresh-1");
    });

    it("пустую сессию не трогает", async () => {
      const { session, refresh } = createSession();

      await session.ensureFreshToken();

      expect(refresh).not.toHaveBeenCalled();
    });
  });

  describe("тихое обновление по таймеру", () => {
    beforeEach(() => {
      vi.useFakeTimers({ now: 0 });
      setVisibility("visible");
    });

    afterEach(() => {
      vi.useRealTimers();
      setVisibility("visible");
    });

    it("обновляет за запас до истечения, а новый срок ставит новый таймер", async () => {
      const { session, refresh } = createSession({ refreshBufferSeconds: 60 });

      refresh.mockResolvedValue(grant("2", 900));
      session.setTokens(grant("1", 900));

      await vi.advanceTimersByTimeAsync(839_000);
      expect(refresh).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(1_000);
      expect(refresh).toHaveBeenCalledTimes(1);
      expect(session.accessToken).toBe("access-2");

      await vi.advanceTimersByTimeAsync(840_000);
      expect(refresh).toHaveBeenCalledTimes(2);
      session.dispose();
    });

    it("скрытая вкладка ждёт, а при возвращении обновляется сразу", async () => {
      const { session, refresh } = createSession();

      session.setTokens(grant("1", 900));
      setVisibility("hidden");

      await vi.advanceTimersByTimeAsync(900_000);
      expect(refresh).not.toHaveBeenCalled();

      setVisibility("visible");
      await vi.advanceTimersByTimeAsync(0);

      expect(refresh).toHaveBeenCalledTimes(1);
      session.dispose();
    });

    it("после временной ошибки повторяет обновление позже", async () => {
      const { session, refresh } = createSession({
        isSessionRejected: () => false,
      });

      session.setTokens(grant("1", 900));
      refresh.mockRejectedValueOnce(new Error("offline"));
      refresh.mockResolvedValueOnce(grant("2", 900));

      await vi.advanceTimersByTimeAsync(840_000);
      expect(refresh).toHaveBeenCalledTimes(1);
      expect(session.accessToken).toBe("access-1");

      await vi.advanceTimersByTimeAsync(10_000);
      expect(refresh).toHaveBeenCalledTimes(2);
      expect(session.accessToken).toBe("access-2");
      session.dispose();
    });

    it("autoRefresh: false — без таймера", async () => {
      const { session, refresh } = createSession({ autoRefresh: false });

      session.setTokens(grant("1", 900));
      await vi.advanceTimersByTimeAsync(1_000_000);

      expect(refresh).not.toHaveBeenCalled();
    });

    it("dispose снимает таймер и слушатели окна", async () => {
      const { session, refresh } = createSession();

      session.setTokens(grant("1", 900));
      session.dispose();
      await vi.advanceTimersByTimeAsync(1_000_000);
      setVisibility("visible");

      expect(refresh).not.toHaveBeenCalled();
    });

    it("выход снимает таймер", async () => {
      const { session, refresh } = createSession();

      session.setTokens(grant("1", 900));
      session.clear();
      await vi.advanceTimersByTimeAsync(1_000_000);

      expect(refresh).not.toHaveBeenCalled();
      session.dispose();
    });
  });

  it("restoreSession поднимает сессию по сохранённому refresh-токену", async () => {
    const storage = new MemoryTokenStorage();

    storage.write({ accessToken: "", refreshToken: "refresh-1" });
    const { session, refresh } = createSession({ storage });

    await expect(session.restoreSession()).resolves.toBe(true);
    expect(refresh).toHaveBeenCalledWith("refresh-1");
    expect(session.accessToken).toBe("access-2");
  });

  it("restoreSession без сохранённого токена не ходит в сеть", async () => {
    const { session, refresh } = createSession();

    await expect(session.restoreSession()).resolves.toBe(false);
    expect(refresh).not.toHaveBeenCalled();
  });

  it("restoreSession при неудачном refresh возвращает false, а не бросает", async () => {
    const storage = new MemoryTokenStorage();

    storage.write({ accessToken: "", refreshToken: "refresh-1" });
    const { session, refresh } = createSession({ storage });

    refresh.mockRejectedValue(new Error("expired"));

    await expect(session.restoreSession()).resolves.toBe(false);
    expect(session.isAuthorized).toBe(false);
  });

  it("onTokenChange срабатывает сразу и на каждую смену access-токена", () => {
    const { session } = createSession();
    const seen: string[] = [];

    session.onTokenChange(token => seen.push(token));
    session.setTokens(pair("1"));
    session.setTokens(pair("2"));
    session.clear();

    expect(seen).toEqual(["", "access-1", "access-2", ""]);
  });

  it("onTokenChange молчит, если access-токен не изменился", () => {
    const { session } = createSession();
    const listener = vi.fn();

    session.setTokens(pair("1"));
    session.onTokenChange(listener);
    session.setTokens({ ...pair("1"), refreshToken: "other" });

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("отписка от onSessionExpired работает", async () => {
    const { session, refresh } = createSession();
    const listener = vi.fn();
    const unsubscribe = session.onSessionExpired(listener);

    unsubscribe();
    refresh.mockRejectedValue(new Error("x"));
    session.setTokens(pair("1"));

    await expect(session.refreshToken()).rejects.toThrow("x");
    expect(listener).not.toHaveBeenCalled();
  });
});

/** Хранилище с ручным внешним писателем — имитирует другую вкладку. */
const createShared = () => {
  const inner = new MemoryTokenStorage();
  const listeners = new Set<(tokens: TokenPair | null) => void>();

  return {
    storage: {
      read: () => inner.read(),
      write: (tokens: TokenPair) => inner.write(tokens),
      clear: () => inner.clear(),
      subscribe: (listener: (tokens: TokenPair | null) => void) => {
        listeners.add(listener);

        return () => listeners.delete(listener);
      },
    },
    writeOutside: (tokens: TokenPair | null) => {
      if (tokens) {
        inner.write(tokens);
      } else {
        inner.clear();
      }
      listeners.forEach(listener => listener(tokens));
    },
    listenerCount: () => listeners.size,
  };
};

describe("TokenSession: правки хранилища извне", () => {
  it("подхватывает токены, записанные снаружи, вместе со сроком и сессией", () => {
    const shared = createShared();
    const { session } = createSession({ storage: shared.storage });
    const seen: string[] = [];
    const external = { ...pair("1"), refreshAt: 5, sessionId: "s-9" };

    session.onTokenChange(token => seen.push(token));
    shared.writeOutside(external);

    expect(session.tokens).toEqual(external);
    expect(session.sessionId).toBe("s-9");
    expect(seen).toEqual(["", "access-1"]);
  });

  it("исчезновение токенов снаружи завершает сессию", () => {
    const shared = createShared();
    const { session } = createSession({ storage: shared.storage });
    const onExpired = vi.fn();

    session.onSessionExpired(onExpired);
    session.setTokens(pair("1"));
    shared.writeOutside(null);

    expect(session.isAuthorized).toBe(false);
    expect(onExpired).toHaveBeenCalledTimes(1);
  });

  it("пустое хранилище без прежней сессии не поднимает onSessionExpired", () => {
    const shared = createShared();
    const { session } = createSession({ storage: shared.storage });
    const onExpired = vi.fn();

    session.onSessionExpired(onExpired);
    shared.writeOutside(null);

    expect(onExpired).not.toHaveBeenCalled();
  });

  it("подхваченные токены не переписываются обратно в хранилище", () => {
    const shared = createShared();
    const write = vi.spyOn(shared.storage, "write");
    const { session } = createSession({ storage: shared.storage });

    shared.writeOutside(pair("2"));

    expect(write).not.toHaveBeenCalled();
    expect(session.accessToken).toBe("access-2");
  });

  it("refresh берёт самый свежий refresh-токен из общего хранилища", async () => {
    const shared = createShared();
    const { session, refresh } = createSession({ storage: shared.storage });

    session.setTokens(pair("1"));
    // Другая вкладка ротировала токен, а пара до этой ещё не дошла.
    shared.storage.write(pair("rotated"));
    await session.refreshToken();

    expect(refresh).toHaveBeenCalledWith("refresh-rotated");
  });

  it("dispose отписывается от хранилища", () => {
    const shared = createShared();
    const { session } = createSession({ storage: shared.storage });

    expect(shared.listenerCount()).toBe(1);
    session.dispose();
    expect(shared.listenerCount()).toBe(0);

    shared.writeOutside(pair("1"));
    expect(session.isAuthorized).toBe(false);
  });

  it("хранилище без subscribe поддерживается", () => {
    const { session } = createSession({ storage: new MemoryTokenStorage() });

    expect(() => session.dispose()).not.toThrow();
  });
});

describe("TokenSession: несколько вкладок", () => {
  /** Web Locks: задачи под одним именем идут строго по очереди. */
  const installLocks = () => {
    let tail: Promise<unknown> = Promise.resolve();

    Object.defineProperty(navigator, "locks", {
      configurable: true,
      value: {
        request: (_name: string, task: () => Promise<unknown>) => {
          const run = tail.then(task);

          tail = run.catch(() => undefined);

          return run;
        },
      },
    });
  };

  /**
   * Две вкладки над общим хранилищем. Запись одной доходит до другой, как
   * через BroadcastChannel; `deliver` задаёт, сразу или с задержкой.
   */
  const createTabs = (deliver: (send: () => void) => void) => {
    const inner = new MemoryTokenStorage();
    const listeners: ((tokens: TokenPair | null) => void)[] = [];

    const storageFor = (index: number): ITokenStorage => ({
      read: () => inner.read(),
      write: tokens => {
        inner.write(tokens);
        listeners.forEach((listener, other) => {
          if (other !== index) deliver(() => listener(tokens));
        });
      },
      clear: () => inner.clear(),
      subscribe: listener => {
        listeners[index] = listener;

        return () => undefined;
      },
    });

    let issued = 0;
    const refresh = vi.fn(async (token: string): Promise<TokenGrant> => {
      if (token !== `refresh-${issued}`) throw new Error(`revoked ${token}`);
      issued += 1;

      return grant(String(issued));
    });

    const config = { refresh, lockName: "test:refresh", autoRefresh: false };
    const first = new TokenSession({ ...config, storage: storageFor(0) });
    const second = new TokenSession({ ...config, storage: storageFor(1) });

    first.setTokens(grant("0"));

    return { first, second, refresh };
  };

  beforeEach(installLocks);

  afterEach(() => {
    Reflect.deleteProperty(navigator, "locks");
  });

  it("одновременное обновление в двух вкладках — один запрос, пара общая", async () => {
    const { first, second, refresh } = createTabs(send => send());

    await Promise.all([first.refreshToken(), second.refreshToken()]);

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(second.tokens).toEqual(first.tokens);
    expect(second.accessToken).toBe("access-1");
  });

  it("пара дошла с опозданием — вторая вкладка обновляет свежим токеном, а не отозванным", async () => {
    const { first, second, refresh } = createTabs(send => {
      setTimeout(send, 50);
    });

    await Promise.all([first.refreshToken(), second.refreshToken()]);

    expect(refresh).toHaveBeenNthCalledWith(1, "refresh-0");
    expect(refresh).toHaveBeenNthCalledWith(2, "refresh-1");
    expect(second.isAuthorized).toBe(true);
    expect(first.isAuthorized).toBe(true);
  });
});

describe("совместимость контрактов", () => {
  it("сессия годится как ITokenSource для bearerAuth", () => {
    const { session } = createSession();
    // Проверка на уровне типов: lib/session не импортирует контракт lib/http,
    // совпадение обеспечивается структурно.
    const source: ITokenSource = session;
    const asSession: ITokenSession = session;

    expect(source.accessToken).toBe(asSession.accessToken);
  });
});
