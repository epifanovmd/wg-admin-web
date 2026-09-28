import { describe, expect, it, vi } from "vitest";

import { PermissionCatalogStore } from "../store";

const catalog = {
  groups: [
    {
      key: "wg:peer",
      label: "Пиры",
      permissions: [{ name: "wg:peer:create", label: "Создание" }],
    },
  ],
};

describe("PermissionCatalogStore", () => {
  it("грузит каталог один раз и подписывает права", async () => {
    const api = {
      getPermissionCatalog: vi.fn().mockResolvedValue({ data: catalog }),
    };
    const store = new PermissionCatalogStore(api as any);

    await store.load();
    await store.load();

    expect(api.getPermissionCatalog).toHaveBeenCalledOnce();
    expect(store.groups).toEqual(catalog.groups);
    expect(store.labelOf("wg:peer:create")).toBe("Создание");
    expect(store.labelOf("x:y")).toBe("x:y");
  });

  it("после ошибки можно загрузить снова", async () => {
    const api = {
      getPermissionCatalog: vi
        .fn()
        .mockResolvedValueOnce({ error: { message: "down" } })
        .mockResolvedValueOnce({ data: catalog }),
    };
    const store = new PermissionCatalogStore(api as any);

    await store.load();
    expect(store.error?.message).toBe("down");

    await store.load();
    expect(store.groups).toHaveLength(1);
  });
});
