import { IMainApi } from "@shared/api";
import type { WgInterfaceDto } from "@shared/api/gen/main/model";
import { iocContainer } from "@shared/lib/di";
import { INotificationService } from "@shared/lib/notifications";
import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useMoveWgInterfaceVM } from "../../model/useMoveWgInterfaceVM";
import { MoveWgInterfaceModal } from "../MoveWgInterfaceModal";

const iface = {
  id: "i1",
  name: "wg0",
  nodeId: "a",
  endpointId: null,
  replicas: [],
} as unknown as WgInterfaceDto;
const api = {
  wgNodeOptions: vi.fn().mockResolvedValue({
    data: [
      { id: "a", name: "Альфа" },
      { id: "b", name: "msk" },
      { id: "c", name: "fra" },
    ],
  }),
  moveWgInterface: vi
    .fn()
    .mockResolvedValue({ data: { ...iface, nodeId: "b" } }),
  addWgInterfaceReplica: vi.fn().mockResolvedValue({
    data: { ...iface, replicas: [{ nodeId: "c" }] },
  }),
};

const toast = { error: vi.fn(), success: vi.fn() };

beforeEach(() => {
  iocContainer.bind(IMainApi.Tid).toConstantValue(api);
  iocContainer.bind(INotificationService.Tid).toConstantValue(toast);
});

afterEach(() => {
  vi.clearAllMocks();
  iocContainer.unbind(IMainApi.Tid);
  iocContainer.unbind(INotificationService.Tid);
});

describe("перенос интерфейса", () => {
  it("исключает текущую ноду, переносит на выбранную и сообщает onMoved", async () => {
    const onMoved = vi.fn();
    const { result } = renderHook(() => useMoveWgInterfaceVM({ onMoved }));

    act(() => result.current.openFor(iface));
    await waitFor(() =>
      expect(result.current.options.map(o => o.value)).toEqual(["b", "c"]),
    );

    act(() => result.current.setNodeId("b"));
    await act(async () => result.current.submit());

    expect(api.moveWgInterface).toHaveBeenCalledWith("i1", { nodeId: "b" });
    expect(onMoved).toHaveBeenCalledWith(
      expect.objectContaining({ nodeId: "b" }),
    );
    expect(result.current.open).toBe(false);
  });

  it("без точки подключения — предупреждение о смене клиентских конфигов", async () => {
    const { result } = renderHook(() =>
      useMoveWgInterfaceVM({ onMoved: vi.fn() }),
    );

    await act(async () => result.current.openFor(iface));
    render(<MoveWgInterfaceModal vm={result.current} />);

    expect(screen.getByText("Клиентские конфиги изменятся")).toBeTruthy();
  });

  it("копирование: без основной ноды и существующих реплик, вызывает addWgInterfaceReplica", async () => {
    const onMoved = vi.fn();
    const withReplica = {
      ...iface,
      replicas: [{ nodeId: "b" }],
    } as unknown as WgInterfaceDto;
    const { result } = renderHook(() => useMoveWgInterfaceVM({ onMoved }));

    act(() => result.current.openFor(withReplica, "copy"));
    expect(result.current.mode).toBe("copy");
    await waitFor(() =>
      expect(result.current.options.map(o => o.value)).toEqual(["c"]),
    );

    act(() => result.current.setNodeId("c"));
    await act(async () => result.current.submit());

    expect(api.addWgInterfaceReplica).toHaveBeenCalledWith("i1", {
      nodeId: "c",
    });
    expect(api.moveWgInterface).not.toHaveBeenCalled();
    expect(onMoved).toHaveBeenCalled();
  });

  it("копия на ноде без агента — уведомление, что поднимется после установки агента", async () => {
    api.addWgInterfaceReplica.mockResolvedValueOnce({
      data: {
        ...iface,
        replicas: [{ nodeId: "c", nodeStatus: "created" }],
      },
    });

    const { result } = renderHook(() =>
      useMoveWgInterfaceVM({ onMoved: vi.fn() }),
    );

    act(() => result.current.openFor(iface, "copy"));
    act(() => result.current.setNodeId("c"));
    await act(async () => result.current.submit());

    expect(toast.success).toHaveBeenCalledWith(
      "Копия wg0 добавлена — поднимется, когда на ноде будет установлен агент",
    );
  });

  it("копия при точке «адрес ноды» — предупреждение, что трафик сам не переключится", async () => {
    const { result } = renderHook(() =>
      useMoveWgInterfaceVM({ onMoved: vi.fn() }),
    );

    await act(async () =>
      result.current.openFor(
        {
          ...iface,
          endpointId: "e1",
          endpoint: {
            name: "msk",
            mode: "direct",
            relayNodeId: null,
            relayNodeName: null,
          },
        } as unknown as WgInterfaceDto,
        "copy",
      ),
    );
    render(<MoveWgInterfaceModal vm={result.current} />);

    expect(
      screen.getByText("Трафик на копию сам не переключится"),
    ).toBeTruthy();
    expect(screen.getByText(/Точка «msk» — адрес ноды/)).toBeTruthy();
  });

  it("копия при точке через релей — без предупреждения", async () => {
    const { result } = renderHook(() =>
      useMoveWgInterfaceVM({ onMoved: vi.fn() }),
    );

    await act(async () =>
      result.current.openFor(
        {
          ...iface,
          endpointId: "e1",
          endpoint: {
            name: "msk-relay",
            mode: "relay",
            relayNodeId: "r",
            relayNodeName: "MSK",
          },
        } as unknown as WgInterfaceDto,
        "copy",
      ),
    );

    expect(result.current.copyWithoutRelay).toBeNull();
  });
});
