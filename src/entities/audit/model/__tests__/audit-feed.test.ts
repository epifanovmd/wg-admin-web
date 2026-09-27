import type { AuditEventDto } from "@shared/api/gen/main/model";
import { describe, expect, it, vi } from "vitest";

import { AUDIT_PAGE_SIZE, AuditFeed } from "../audit-feed";

const event = (id: string): AuditEventDto => ({
  id,
  type: "auth.login.succeeded",
  actorId: "u-1",
  subjectId: null,
  ip: null,
  userAgent: null,
  meta: {},
  createdAt: "2026-09-26T10:00:00.000Z",
});

describe("AuditFeed", () => {
  it("первая страница без курсора, следующая — по nextCursor", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce({
        data: { items: [event("e-1")], nextCursor: "c-1" },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { items: [event("e-2")], nextCursor: null },
        error: null,
      });
    const feed = new AuditFeed(fetch);

    await feed.load();

    expect(fetch).toHaveBeenLastCalledWith(undefined, AUDIT_PAGE_SIZE);
    expect(feed.hasMore).toBe(true);

    await feed.loadMore();

    expect(fetch).toHaveBeenLastCalledWith("c-1", AUDIT_PAGE_SIZE);
    expect(feed.items.map(e => e.id)).toEqual(["e-1", "e-2"]);
    expect(feed.hasMore).toBe(false);
  });

  it("без курсора loadMore ничего не запрашивает", async () => {
    const fetch = vi.fn().mockResolvedValue({
      data: { items: [event("e-1")], nextCursor: null },
      error: null,
    });
    const feed = new AuditFeed(fetch);

    await feed.load();
    await feed.loadMore();

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("повторная загрузка начинает ленту заново", async () => {
    const fetch = vi.fn().mockResolvedValue({
      data: { items: [event("e-1")], nextCursor: "c-1" },
      error: null,
    });
    const feed = new AuditFeed(fetch);

    await feed.load();
    await feed.load();

    expect(fetch).toHaveBeenNthCalledWith(2, undefined, AUDIT_PAGE_SIZE);
    expect(feed.items).toHaveLength(1);
  });

  it("ошибка первой страницы видна в error", async () => {
    const feed = new AuditFeed(
      vi.fn().mockResolvedValue({ data: null, error: { message: "403" } }),
    );

    await feed.load();

    expect(feed.error?.message).toBe("403");
    expect(feed.items).toEqual([]);
  });
});
