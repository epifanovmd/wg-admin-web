import { observable, runInAction } from "mobx";
import { describe, expect, it, vi } from "vitest";

import { AppDataStore } from "../app-data.store";

vi.mock("../router", () => ({ router: { navigate: vi.fn() } }));

const setup = () => {
  const auth = observable(
    {
      isAuthenticated: true,
      isIdle: false,
      restore: vi.fn(async () => undefined),
    },
    { restore: false },
  );
  const userStore = { load: vi.fn(), reset: vi.fn() };
  const nodesStore = { reset: vi.fn() };
  const jobStore = { reset: vi.fn() };
  const initializer = { initialize: vi.fn(() => vi.fn()) };
  const store = new AppDataStore(
    auth as any,
    initializer as any,
    initializer as any,
    userStore as any,
    initializer as any,
    jobStore as any,
    nodesStore as any,
  );

  runInAction(() => (auth.isAuthenticated = false));
  store.initialize();
  runInAction(() => (auth.isAuthenticated = true));

  return { auth, userStore, nodesStore, jobStore };
};

describe("AppDataStore", () => {
  it("выход сбрасывает данные пользователя: следующий вход не видит прежних прав", () => {
    const { auth, userStore, nodesStore, jobStore } = setup();

    expect(userStore.load).toHaveBeenCalledOnce();

    runInAction(() => (auth.isAuthenticated = false));

    expect(userStore.reset).toHaveBeenCalledOnce();
    expect(nodesStore.reset).toHaveBeenCalledOnce();
    expect(jobStore.reset).toHaveBeenCalledOnce();
  });
});

describe("AppDataStore — восстановление сессии", () => {
  /**
   * Жалоба: после 401 на refresh — пустой экран на /sign-in.
   *
   * Сессия восстанавливалась в async beforeLoad корневого маршрута: роутер
   * успевал показать экран ожидания, а редирект с `_app` попадал в гонку
   * перехода, где маршрут бросал undefined. Теперь сессия восстанавливается до
   * того, как роутер вообще появится, и его beforeLoad синхронны.
   */
  it("до конца restore роутер не запускается — isRestored ждёт его", async () => {
    let finish!: () => void;
    const auth = observable(
      {
        isAuthenticated: false,
        isIdle: true,
        restore: vi.fn(
          () =>
            new Promise<void>(resolve => {
              finish = resolve;
            }),
        ),
      },
      { restore: false },
    );
    const stub = {
      initialize: vi.fn(() => vi.fn()),
      reset: vi.fn(),
      load: vi.fn(),
    };
    const store = new AppDataStore(
      auth as any,
      stub as any,
      stub as any,
      stub as any,
      stub as any,
      stub as any,
      stub as any,
    );

    store.initialize();

    expect(auth.restore).toHaveBeenCalledOnce();
    expect(store.isRestored).toBe(false);

    finish();
    await Promise.resolve();
    await Promise.resolve();

    expect(store.isRestored).toBe(true);
  });

  it("сессия уже восстановлена — роутер сразу", () => {
    const auth = observable(
      {
        isAuthenticated: true,
        isIdle: false,
        restore: vi.fn(),
      },
      { restore: false },
    );
    const stub = {
      initialize: vi.fn(() => vi.fn()),
      reset: vi.fn(),
      load: vi.fn(),
    };
    const store = new AppDataStore(
      auth as any,
      stub as any,
      stub as any,
      stub as any,
      stub as any,
      stub as any,
      stub as any,
    );

    store.initialize();

    expect(auth.restore).not.toHaveBeenCalled();
    expect(store.isRestored).toBe(true);
  });
});
