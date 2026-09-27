import type { IStorageService } from "@shared/lib/storage";

import { MemoryTokenStorage } from "../storage/memory-token-storage";
import { PersistentTokenStorage } from "../storage/persistent-token-storage";

const createStorage = () => {
  const map = new Map<string, string>();

  return {
    keys: () => [...map.keys()],
    service: {
      getItem: (key: string) => map.get(key) ?? null,
      setItem: (key: string, value: string) => {
        map.set(key, value);
      },
      removeItem: (key: string) => {
        map.delete(key);
      },
    } satisfies IStorageService,
  };
};

const tokens = { accessToken: "a", refreshToken: "r" };

describe("MemoryTokenStorage", () => {
  it("хранит пару до clear", () => {
    const storage = new MemoryTokenStorage();

    expect(storage.read()).toBeNull();
    storage.write(tokens);
    expect(storage.read()).toEqual(tokens);
    storage.clear();
    expect(storage.read()).toBeNull();
  });
});

describe("PersistentTokenStorage", () => {
  it("по умолчанию сохраняет только refresh-токен", () => {
    const backing = createStorage();
    const storage = new PersistentTokenStorage(backing.service, {
      key: "refresh",
    });

    storage.write(tokens);

    expect(backing.keys()).toEqual(["refresh"]);
    expect(storage.read()).toEqual({ accessToken: "", refreshToken: "r" });
  });

  it("с accessKey сохраняет оба токена", () => {
    const backing = createStorage();
    const storage = new PersistentTokenStorage(backing.service, {
      key: "refresh",
      accessKey: "access",
    });

    storage.write(tokens);

    expect(storage.read()).toEqual(tokens);
  });

  it("пустой токен удаляет ключ, а не пишет пустую строку", () => {
    const backing = createStorage();
    const storage = new PersistentTokenStorage(backing.service, {
      key: "refresh",
      accessKey: "access",
    });

    storage.write(tokens);
    storage.write({ accessToken: "", refreshToken: "" });

    expect(backing.keys()).toEqual([]);
    expect(storage.read()).toBeNull();
  });

  it("clear удаляет оба ключа", () => {
    const backing = createStorage();
    const storage = new PersistentTokenStorage(backing.service, {
      key: "refresh",
      accessKey: "access",
    });

    storage.write(tokens);
    storage.clear();

    expect(backing.keys()).toEqual([]);
  });
});
