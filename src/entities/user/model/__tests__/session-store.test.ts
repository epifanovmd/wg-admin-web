import type { IMainApi } from "@shared/api";
import type { SessionDto } from "@shared/api/gen/main/model";
import type { IAuthSessionGuard } from "@shared/lib/contracts";
import { describe, expect, it, vi } from "vitest";

import { SessionStore } from "../session-store";

const session = (id: string): SessionDto => ({
  id,
  userId: "u-1",
  deviceName: null,
  deviceType: null,
  ip: "127.0.0.1",
  userAgent: null,
  lastActiveAt: "2026-09-26T10:00:00.000Z",
  expiresAt: "2026-10-03T10:00:00.000Z",
  createdAt: "2026-09-26T10:00:00.000Z",
});

const createStore = (items: SessionDto[]) => {
  const api = {
    getSessions: vi.fn().mockResolvedValue({
      data: { items, total: items.length, offset: 0, limit: 20 },
      error: null,
    }),
  } as unknown as IMainApi;
  const guard = {
    isCurrentSession: vi.fn(),
    signOut: vi.fn(),
  } as unknown as IAuthSessionGuard;

  return new SessionStore(api, guard);
};

describe("SessionStore", () => {
  it("load берёт сессии из страницы ответа", async () => {
    const store = createStore([session("s-1"), session("s-2")]);

    await store.load();

    expect(store.sessions.map(s => s.id)).toEqual(["s-1", "s-2"]);
  });
});
