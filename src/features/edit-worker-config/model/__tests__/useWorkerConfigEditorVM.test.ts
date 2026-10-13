import { IMainApi } from "@shared/api";
import type { AgentConfigDto } from "@shared/api/gen/main/model";
import { iocContainer } from "@shared/lib/di";
import { HttpError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { IWorkerConfigTarget } from "../types";
import { useWorkerConfigEditorVM } from "../useWorkerConfigEditorVM";

const confirm = vi.fn();

vi.mock("@shared/ui", async importOriginal => ({
  ...(await importOriginal<object>()),
  useConfirm: () => confirm,
}));

const entry = (version: number, data: unknown): AgentConfigDto => ({
  agentId: "a-1",
  worker: "echo",
  key: "settings",
  version,
  state: "applied",
  data,
  updatedAt: 1,
});

const target = (
  patch: Partial<IWorkerConfigTarget> = {},
): IWorkerConfigTarget => ({
  agentId: "a-1",
  worker: "echo",
  key: "settings",
  manifest: {
    key: "settings",
    schema: {
      type: "object",
      required: ["prefix"],
      properties: { prefix: { type: "string" } },
    },
  },
  entry: null,
  ...patch,
});

const api = {
  setAgentWorkerConfig: vi.fn(),
  deleteAgentWorkerConfig: vi.fn(),
};
const toast = { error: vi.fn(), success: vi.fn() };

beforeEach(() => {
  confirm.mockResolvedValue(true);
  iocContainer.bind(IMainApi.Tid).toConstantValue(api);
  iocContainer.bind(INotificationService.Tid).toConstantValue(toast);
});

afterEach(() => {
  iocContainer.unbind(IMainApi.Tid);
  iocContainer.unbind(INotificationService.Tid);
  vi.clearAllMocks();
});

describe("useWorkerConfigEditorVM", () => {
  it("новый ключ — заготовка по схеме, заданный — его значение", () => {
    const { result } = renderHook(() => useWorkerConfigEditorVM());

    act(() => result.current.openFor(target()));
    expect(result.current.form.getValues("value")).toBe('{\n  "prefix": ""\n}');

    act(() =>
      result.current.openFor(target({ entry: entry(4, { prefix: ">" }) })),
    );
    expect(result.current.form.getValues("value")).toBe(
      '{\n  "prefix": ">"\n}',
    );
  });

  it("сохранение: новая версия наверх, окно закрывается", async () => {
    const saved = entry(5, { prefix: "!" });
    const onSaved = vi.fn();

    api.setAgentWorkerConfig.mockResolvedValue({ data: saved });

    const { result } = renderHook(() => useWorkerConfigEditorVM({ onSaved }));

    act(() => result.current.openFor(target()));
    await act(() => result.current.save({ value: '{"prefix":"!"}' }));

    expect(api.setAgentWorkerConfig).toHaveBeenCalledWith(
      "a-1",
      "echo",
      "settings",
      { prefix: "!" },
    );
    expect(onSaved).toHaveBeenCalledWith(saved);
    expect(toast.success).toHaveBeenCalledWith(
      "echo/settings: версия 5 задана",
    );
    expect(result.current.target).toBeNull();
  });

  it("значение не по схеме — текст сервера у поля, без уведомления", async () => {
    api.setAgentWorkerConfig.mockResolvedValue({
      error: new HttpError({
        status: 400,
        body: {
          code: "AGENT_CONFIG_INVALID",
          message: "Значение не подходит под схему",
          details: { reason: "echo/settings: prefix: ожидается строка" },
        },
      }),
    });

    const { result } = renderHook(() => useWorkerConfigEditorVM());

    act(() => result.current.openFor(target()));
    await act(() => result.current.save({ value: '{"prefix":1}' }));

    expect(result.current.form.getFieldState("value").error?.message).toBe(
      "Значение не подходит под схему. echo/settings: prefix: ожидается строка",
    );
    expect(toast.error).not.toHaveBeenCalled();
    expect(result.current.target).not.toBeNull();
  });

  it("другая ошибка — уведомлением", async () => {
    api.setAgentWorkerConfig.mockResolvedValue({
      error: { code: "AGENT_NOT_FOUND", message: "Агент не найден" },
    });

    const { result } = renderHook(() => useWorkerConfigEditorVM());

    act(() => result.current.openFor(target()));
    await act(() => result.current.save({ value: "{}" }));

    expect(toast.error).toHaveBeenCalledWith("Агент не найден");
  });

  it("удаление — после подтверждения, наверх сообщается ключ", async () => {
    const onDeleted = vi.fn();

    api.deleteAgentWorkerConfig.mockResolvedValue({ data: undefined });
    confirm.mockResolvedValueOnce(false);

    const { result } = renderHook(() => useWorkerConfigEditorVM({ onDeleted }));
    const item = target({ entry: entry(2, {}) });

    await act(() => result.current.remove(item));
    expect(api.deleteAgentWorkerConfig).not.toHaveBeenCalled();

    await act(() => result.current.remove(item));
    expect(api.deleteAgentWorkerConfig).toHaveBeenCalledWith(
      "a-1",
      "echo",
      "settings",
    );
    expect(onDeleted).toHaveBeenCalledWith(item);
  });
});
