import { describe, expect, it, vi } from "vitest";

import { UserRealtime } from "../realtime";

const setup = () => {
  let handlers: Record<string, (data: unknown) => void> = {};
  const socket = {
    subscribe: (h: typeof handlers) => {
      handlers = h;

      return () => {};
    },
  };
  const userStore = {
    user: { id: "u1" },
    refresh: vi.fn().mockResolvedValue({ data: null, error: null }),
    patchProfile: vi.fn(),
  };

  new UserRealtime(
    socket as never,
    userStore as never,
    {} as never,
  ).initialize();

  return { handlers, userStore };
};

describe("UserRealtime", () => {
  it("свой profile:updated — перечитать пользователя (изменения с другого устройства)", () => {
    const { handlers, userStore } = setup();

    handlers.onProfileUpdated({ userId: "u1", firstName: "Иван" });

    expect(userStore.refresh).toHaveBeenCalledTimes(1);
    expect(userStore.patchProfile).not.toHaveBeenCalled();
  });

  it("чужой profile:updated игнорируется", () => {
    const { handlers, userStore } = setup();

    handlers.onProfileUpdated({ userId: "u2", firstName: null });

    expect(userStore.refresh).not.toHaveBeenCalled();
  });
});
