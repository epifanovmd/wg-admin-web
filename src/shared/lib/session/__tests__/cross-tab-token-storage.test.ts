import type { IStorageService } from "@shared/lib/storage";

import type { TokenPair } from "../session.types";
import { CrossTabTokenStorage } from "../storage/cross-tab-token-storage";
import { PersistentTokenStorage } from "../storage/persistent-token-storage";

const REFRESH_KEY = "app:refresh_token";

const tokens: TokenPair = { accessToken: "a", refreshToken: "r" };

const createBacking = (): IStorageService => ({
  getItem: key => localStorage.getItem(key),
  setItem: (key, value) => localStorage.setItem(key, value),
  removeItem: key => localStorage.removeItem(key),
});

const createStorage = (channel?: string) =>
  new CrossTabTokenStorage(
    new PersistentTokenStorage(createBacking(), { key: REFRESH_KEY }),
    { keys: [REFRESH_KEY], channel },
  );

/** Событие `storage` браузер шлёт только в чужие вкладки. */
const emitStorageEvent = (key: string | null) =>
  window.dispatchEvent(new StorageEvent("storage", { key }));

describe("CrossTabTokenStorage: событие storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("делегирует чтение, запись и очистку", () => {
    const storage = createStorage();

    storage.write(tokens);
    expect(localStorage.getItem(REFRESH_KEY)).toBe("r");
    expect(storage.read()).toEqual({ accessToken: "", refreshToken: "r" });

    storage.clear();
    expect(storage.read()).toBeNull();
  });

  it("сообщает о правке следимого ключа из другой вкладки", () => {
    const storage = createStorage();
    const listener = vi.fn();

    storage.subscribe(listener);
    localStorage.setItem(REFRESH_KEY, "from-other-tab");
    emitStorageEvent(REFRESH_KEY);

    expect(listener).toHaveBeenCalledWith({
      accessToken: "",
      refreshToken: "from-other-tab",
    });
  });

  it("полная очистка хранилища тоже считается правкой", () => {
    const storage = createStorage();
    const listener = vi.fn();

    storage.write(tokens);
    storage.subscribe(listener);
    localStorage.clear();
    emitStorageEvent(null);

    expect(listener).toHaveBeenCalledWith(null);
  });

  it("чужие ключи игнорируются", () => {
    const storage = createStorage();
    const listener = vi.fn();

    storage.subscribe(listener);
    emitStorageEvent("theme");

    expect(listener).not.toHaveBeenCalled();
  });

  it("отписка снимает слушателя окна", () => {
    const storage = createStorage();
    const listener = vi.fn();

    storage.subscribe(listener)();
    emitStorageEvent(REFRESH_KEY);

    expect(listener).not.toHaveBeenCalled();
  });
});

describe("CrossTabTokenStorage: BroadcastChannel", () => {
  const CHANNEL = "test:tokens";
  const full: TokenPair = {
    accessToken: "a",
    refreshToken: "r",
    expiresAt: 10,
    refreshAt: 5,
    sessionId: "s-1",
  };

  /** Сообщение канала приходит асинхронно. */
  const nextMessage = () => new Promise(resolve => setTimeout(resolve, 20));

  beforeEach(() => {
    localStorage.clear();
  });

  it("другая вкладка получает полную пару, а на диск ложится только refresh", async () => {
    const writer = createStorage(CHANNEL);
    const reader = createStorage(CHANNEL);
    const listener = vi.fn();

    reader.subscribe(listener);
    writer.write(full);
    await nextMessage();

    expect(listener).toHaveBeenCalledWith(full);
    expect(localStorage.getItem(REFRESH_KEY)).toBe("r");
    expect(reader.read()).toEqual({ accessToken: "", refreshToken: "r" });

    writer.dispose();
    reader.dispose();
  });

  it("выход рассылается как null", async () => {
    const writer = createStorage(CHANNEL);
    const reader = createStorage(CHANNEL);
    const listener = vi.fn();

    reader.subscribe(listener);
    writer.clear();
    await nextMessage();

    expect(listener).toHaveBeenCalledWith(null);

    writer.dispose();
    reader.dispose();
  });

  it("с каналом событие storage не дублирует доставку", () => {
    const storage = createStorage(CHANNEL);
    const listener = vi.fn();

    storage.subscribe(listener);
    emitStorageEvent(REFRESH_KEY);

    expect(listener).not.toHaveBeenCalled();
    storage.dispose();
  });

  it("отписка снимает слушателя канала", async () => {
    const writer = createStorage(CHANNEL);
    const reader = createStorage(CHANNEL);
    const listener = vi.fn();

    reader.subscribe(listener)();
    writer.write(full);
    await nextMessage();

    expect(listener).not.toHaveBeenCalled();

    writer.dispose();
    reader.dispose();
  });
});
