import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { copyToClipboard, useClipboard } from "../use-clipboard";

afterEach(() => {
  vi.useRealTimers();
  Object.assign(navigator, { clipboard: undefined });
});

describe("copyToClipboard", () => {
  it("пишет через Clipboard API, когда он есть", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    Object.assign(navigator, { clipboard: { writeText } });

    await copyToClipboard("abc");

    expect(writeText).toHaveBeenCalledWith("abc");
  });

  it("без Clipboard API копирует выделением и убирает поле", async () => {
    Object.assign(document, { execCommand: vi.fn().mockReturnValue(true) });

    await copyToClipboard("abc");

    expect(document.execCommand).toHaveBeenCalledWith("copy");
    expect(document.querySelector("textarea")).toBeNull();
  });

  it("отказ браузера — ошибка", async () => {
    Object.assign(document, { execCommand: vi.fn().mockReturnValue(false) });

    await expect(copyToClipboard("abc")).rejects.toThrow();
    expect(document.querySelector("textarea")).toBeNull();
  });
});

describe("useClipboard", () => {
  it("copied держится timeout и сбрасывается", async () => {
    vi.useFakeTimers();
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });

    const { result } = renderHook(() => useClipboard({ timeout: 500 }));

    await act(async () => {
      result.current.copy("abc");
    });
    expect(result.current.copied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.copied).toBe(false);
  });

  it("ошибка копирования попадает в error", async () => {
    Object.assign(document, { execCommand: vi.fn().mockReturnValue(false) });

    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      result.current.copy("abc");
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.copied).toBe(false);
  });
});
