import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

import { applyZodLocale } from "./src/shared/lib/validation/zod-locale";

class ResizeObserverMock implements ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

globalThis.ResizeObserver = ResizeObserverMock;

// jsdom не реализует прокрутку окна (её вызывает роутер при навигации).
window.scrollTo = () => undefined;

// Сообщения Zod — как у пользователя (русская локаль приложения).
applyZodLocale();

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
