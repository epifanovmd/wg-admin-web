import { IMainApi } from "@shared/api";
import type { WgEndpointDto } from "@shared/api/gen/main/model";
import { iocContainer } from "@shared/lib/di";
import { INotificationService } from "@shared/lib/notifications";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  useWgEndpointFormVM,
  wgEndpointFormSchema,
} from "../useWgEndpointFormVM";

const api = {
  wgNodeOptions: vi.fn().mockResolvedValue({ data: [] }),
  createWgEndpoint: vi.fn().mockResolvedValue({ data: { id: "e1" } }),
  updateWgEndpoint: vi.fn(),
};

beforeEach(() => {
  iocContainer.bind(IMainApi.Tid).toConstantValue(api);
  iocContainer
    .bind(INotificationService.Tid)
    .toConstantValue({ error: vi.fn(), success: vi.fn() });
});

afterEach(() => {
  vi.clearAllMocks();
  iocContainer.unbind(IMainApi.Tid);
  iocContainer.unbind(INotificationService.Tid);
});

describe("useWgEndpointFormVM", () => {
  it("новая точка: IPIP и маршрут «авто»; маршрут уходит в запрос", async () => {
    const onSaved = vi.fn();
    const { result } = renderHook(() => useWgEndpointFormVM({ onSaved }));

    act(() => result.current.openCreate());
    expect(result.current.form.getValues()).toMatchObject({
      forwardMode: "ipip",
      route: "auto",
    });

    const values = wgEndpointFormSchema.parse({
      name: "msk-relay",
      host: "147.45.245.104",
      mode: "relay",
      relayNodeId: "r1",
      forwardMode: "ipip",
      route: "tunnel",
    });

    await act(async () => result.current.submit(values));

    expect(api.createWgEndpoint).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "relay",
        forwardMode: "ipip",
        route: "tunnel",
      }),
    );
    expect(onSaved).toHaveBeenCalled();
  });

  it("живое обновление: открытая точка подменяется новыми данными, чужая — нет", () => {
    const { result } = renderHook(() =>
      useWgEndpointFormVM({ onSaved: vi.fn() }),
    );
    const endpoint = {
      id: "e1",
      name: "msk",
      host: "147.45.245.104",
      mode: "direct",
      relayNodeId: null,
      forwardMode: "dnat",
      route: "auto",
      description: null,
      interfaces: [],
    } as unknown as WgEndpointDto;
    const target = {
      interfaceId: "i1",
      interfaceName: "wg0",
      nodeId: "a",
      nodeName: "Нидерланды",
      port: 51820,
      copyNodeIds: ["c"],
    };

    act(() => result.current.openEdit(endpoint));
    act(() =>
      result.current.syncEditing({ ...endpoint, interfaces: [target] }),
    );
    expect(result.current.editing?.interfaces).toEqual([target]);

    act(() =>
      result.current.syncEditing({ ...endpoint, id: "e2", interfaces: [] }),
    );
    expect(result.current.editing?.interfaces).toEqual([target]);
  });
});
