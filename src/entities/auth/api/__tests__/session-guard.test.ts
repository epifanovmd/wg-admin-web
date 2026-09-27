import { TokenSession } from "@shared/lib/session";
import { describe, expect, it, vi } from "vitest";

import type { IAuthStore } from "../../model/types";
import { AuthSessionGuard } from "../session-guard";

const createGuard = () => {
  const session = new TokenSession({
    refresh: vi.fn(),
    autoRefresh: false,
  });
  const auth = { signOut: vi.fn() } as unknown as IAuthStore;

  return { guard: new AuthSessionGuard(auth, session), session, auth };
};

describe("AuthSessionGuard", () => {
  it("узнаёт свою сессию по sessionId из ответа бэкенда", () => {
    const { guard, session } = createGuard();

    session.setTokens({
      accessToken: "opaque-access",
      refreshToken: "r",
      sessionId: "s-1",
    });

    expect(guard.isCurrentSession("s-1")).toBe(true);
    expect(guard.isCurrentSession("s-2")).toBe(false);
  });

  it("без сессии чужие события не считает своими", () => {
    const { guard } = createGuard();

    expect(guard.isCurrentSession("s-1")).toBe(false);
  });

  it("signOut выходит через стор авторизации", () => {
    const { guard, auth } = createGuard();

    guard.signOut();

    expect(auth.signOut).toHaveBeenCalledTimes(1);
  });
});
