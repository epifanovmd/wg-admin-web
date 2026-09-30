import { IUserStore } from "@entities/user";
import { WG_PERMISSIONS } from "@entities/wg";
import { IMainApi } from "@shared/api";
import type { WgPeerDto } from "@shared/api/gen/main/model";
import { ownPermission } from "@shared/lib/access";
import { createFakeAccess } from "@shared/lib/access/testing";
import { iocContainer } from "@shared/lib/di";
import { INotificationService } from "@shared/lib/notifications";
import { ISocketTransport } from "@shared/lib/socket";
import { createFakeSocket, type IFakeSocket } from "@shared/lib/socket/testing";
import { act, renderHook, waitFor } from "@testing-library/react";
import { reaction } from "mobx";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { compactPeersFilters } from "../types";
import { useWgPeersTableVM } from "../useWgPeersTableVM";

vi.mock("@shared/ui", async importOriginal => ({
  ...(await importOriginal<object>()),
  useConfirm: () => vi.fn(),
}));
vi.mock("@features/wg-peer-config", () => ({
  useWgPeerConfigVM: () => ({ openFor: vi.fn() }),
}));

const peer = { id: "p1", name: "iphone", enabled: true } as WgPeerDto;
const api = {
  listWgPeers: vi.fn().mockResolvedValue({ data: { items: [peer], total: 1 } }),
};
let socket: IFakeSocket;

beforeEach(() => {
  socket = createFakeSocket();
  iocContainer.bind(ISocketTransport.Tid).toConstantValue(socket);
  iocContainer.bind(IMainApi.Tid).toConstantValue(api);
  iocContainer
    .bind(INotificationService.Tid)
    .toConstantValue({ error: vi.fn(), success: vi.fn() });
  iocContainer
    .bind(IUserStore.Tid)
    .toConstantValue(createFakeAccess({ permissions: ["*"] }));
});

afterEach(() => {
  iocContainer.unbind(ISocketTransport.Tid);
  iocContainer.unbind(IMainApi.Tid);
  iocContainer.unbind(INotificationService.Tid);
  iocContainer.unbind(IUserStore.Tid);
  vi.clearAllMocks();
});

describe("compactPeersFilters", () => {
  it("убирает пустые значения, false — сохраняет", () => {
    expect(
      compactPeersFilters({
        query: "",
        nodeId: undefined,
        enabled: false,
        online: true,
      }),
    ).toEqual({ enabled: false, online: true });
  });
});

describe("useWgPeersTableVM", () => {
  it("фильтры уходят в API; смена фильтров — новый запрос", async () => {
    const { result, rerender } = renderHook(
      ({ filters }) => useWgPeersTableVM(filters),
      { initialProps: { filters: { interfaceId: "i1", enabled: false } } },
    );

    await waitFor(() => expect(result.current.peers.items).toHaveLength(1));
    expect(api.listWgPeers).toHaveBeenLastCalledWith(
      expect.objectContaining({ interfaceId: "i1", enabled: false }),
    );

    rerender({
      filters: { interfaceId: "i1", enabled: false, query: "ip" } as any,
    });
    await waitFor(() =>
      expect(api.listWgPeers).toHaveBeenLastCalledWith(
        expect.objectContaining({ query: "ip" }),
      ),
    );
  });

  it("изменения пира и удаление приходят событиями", async () => {
    const { result } = renderHook(() => useWgPeersTableVM({}));

    await waitFor(() => expect(result.current.peers.items).toHaveLength(1));

    act(() => socket.fire("wg:peer:updated", { ...peer, enabled: false }));
    expect(result.current.peers.items[0].enabled).toBe(false);

    act(() => socket.fire("wg:peer:deleted", { id: "p1" }));
    expect(result.current.peers.items).toHaveLength(0);
  });

  it("живая статистика обновляет трафик, handshake и онлайн пира", async () => {
    const { result } = renderHook(() => useWgPeersTableVM({}));

    await waitFor(() => expect(result.current.peers.items).toHaveLength(1));

    act(() =>
      socket.fire("wg:peers:stats", {
        peers: [
          {
            peerId: "p1",
            online: true,
            lastHandshakeAt: "2026-09-27T12:00:00.000Z",
            endpoint: "198.51.100.9:40000",
            rxTotal: 1000,
            txTotal: 2000,
          },
        ],
      }),
    );

    expect(result.current.peers.items[0]).toMatchObject({
      name: "iphone",
      isOnline: true,
      lastHandshakeAt: "2026-09-27T12:00:00.000Z",
      lastEndpoint: "198.51.100.9:40000",
      rxBytesTotal: 1000,
      txBytesTotal: 2000,
    });

    act(() =>
      socket.fire("wg:peers:stats", {
        peers: [{ peerId: "other", rxTotal: 1 }],
      }),
    );
    expect(result.current.peers.items).toHaveLength(1);
  });

  it("пачка статистики за тик обновляет пиры списка", async () => {
    const { result } = renderHook(() => useWgPeersTableVM({}));

    await waitFor(() => expect(result.current.peers.items).toHaveLength(1));

    act(() =>
      socket.fire("wg:peers:stats", {
        peers: [
          { peerId: "other", online: true, rxTotal: 1, txTotal: 1 },
          { peerId: "p1", online: false, rxTotal: 5000, txTotal: 7000 },
        ],
      }),
    );

    expect(result.current.peers.items).toHaveLength(1);
    expect(result.current.peers.items[0]).toMatchObject({
      isOnline: false,
      rxBytesTotal: 5000,
      txBytesTotal: 7000,
    });
  });

  it("пачка за тик — одно изменение списка; без изменений — ни одного", async () => {
    api.listWgPeers.mockResolvedValueOnce({
      data: {
        items: [peer, { ...peer, id: "p2", name: "mac" }],
        total: 2,
      },
    });

    const { result } = renderHook(() => useWgPeersTableVM({}));

    await waitFor(() => expect(result.current.peers.items).toHaveLength(2));

    const changes = vi.fn();
    const dispose = reaction(() => result.current.peers.holder.items, changes);
    const tick = {
      peers: ["p1", "p2"].map(peerId => ({
        peerId,
        online: true,
        lastHandshakeAt: null,
        endpoint: null,
        rxTotal: 10,
        txTotal: 20,
      })),
    };

    act(() => socket.fire("wg:peers:stats", tick));
    expect(changes).toHaveBeenCalledTimes(1);

    act(() => socket.fire("wg:peers:stats", tick));
    expect(changes).toHaveBeenCalledTimes(1);
    dispose();
  });

  it("держатель без права видеть всех — комната «мои пиры», не обзор", async () => {
    iocContainer
      .rebind(IUserStore.Tid)
      .toConstantValue(
        createFakeAccess({
          permissions: [ownPermission(WG_PERMISSIONS.PEER_VIEW)],
        }),
      );

    renderHook(() => useWgPeersTableVM({}));

    await waitFor(() =>
      expect(
        socket.emitted
          .filter(({ event }) => event === "room:subscribe")
          .map(({ args }) => args[0]),
      ).toEqual([{ type: "wg-peers-own", id: "u1" }]),
    );
  });

  it("держателю назначили пир — список перезапрашивается", async () => {
    iocContainer
      .rebind(IUserStore.Tid)
      .toConstantValue(
        createFakeAccess({
          permissions: [ownPermission(WG_PERMISSIONS.PEER_VIEW)],
        }),
      );
    const assigned = { ...peer, id: "p2", userId: "u1" };

    const { result } = renderHook(() => useWgPeersTableVM({}));

    await waitFor(() => expect(result.current.peers.items).toHaveLength(1));
    api.listWgPeers.mockResolvedValueOnce({
      data: { items: [peer, assigned], total: 2 },
    });

    act(() => socket.fire("wg:peer:updated", assigned));
    await waitFor(() => expect(result.current.peers.items).toHaveLength(2));
  });

  it("чужой незнакомый пир у держателя — без перезапроса", async () => {
    iocContainer
      .rebind(IUserStore.Tid)
      .toConstantValue(
        createFakeAccess({
          permissions: [ownPermission(WG_PERMISSIONS.PEER_VIEW)],
        }),
      );

    const { result } = renderHook(() => useWgPeersTableVM({}));

    await waitFor(() => expect(result.current.peers.items).toHaveLength(1));
    act(() =>
      socket.fire("wg:peer:updated", { ...peer, id: "p2", userId: "u2" }),
    );
    expect(api.listWgPeers).toHaveBeenCalledTimes(1);
  });

  it("фильтр по владельцу: переназначенный пир уходит, назначенный — появляется", async () => {
    const own = { ...peer, userId: "u2" };

    api.listWgPeers.mockResolvedValueOnce({ data: { items: [own], total: 1 } });

    const { result } = renderHook(() => useWgPeersTableVM({ userId: "u2" }));

    await waitFor(() => expect(result.current.peers.items).toHaveLength(1));

    act(() => socket.fire("wg:peer:updated", { ...own, userId: "u3" }));
    expect(result.current.peers.items).toHaveLength(0);

    const assigned = { ...peer, id: "p2", userId: "u2" };

    api.listWgPeers.mockResolvedValueOnce({
      data: { items: [assigned], total: 1 },
    });
    act(() => socket.fire("wg:peer:updated", assigned));
    await waitFor(() =>
      expect(result.current.peers.items.map(item => item.id)).toEqual(["p2"]),
    );
  });

  it("фильтр «только онлайн»: ушедший офлайн пир пропадает из списка", async () => {
    api.listWgPeers.mockResolvedValueOnce({
      data: { items: [{ ...peer, isOnline: true }], total: 1 },
    });

    const { result } = renderHook(() => useWgPeersTableVM({ online: true }));

    await waitFor(() => expect(result.current.peers.items).toHaveLength(1));

    act(() =>
      socket.fire("wg:peers:stats", {
        peers: [{ peerId: "p1", online: false, rxTotal: 0, txTotal: 0 }],
      }),
    );
    expect(result.current.peers.items).toHaveLength(0);
  });

  it("фильтр «только онлайн»: вышедший в онлайн пир интерфейса — перезапрос списка", async () => {
    api.listWgPeers.mockResolvedValueOnce({
      data: { items: [{ ...peer, isOnline: true }], total: 1 },
    });

    const { result } = renderHook(() =>
      useWgPeersTableVM({ interfaceId: "i1", online: true }),
    );

    await waitFor(() => expect(result.current.peers.items).toHaveLength(1));

    const live = (peerId: string, interfaceId: string, online: boolean) => ({
      peerId,
      interfaceId,
      online,
      rxTotal: 0,
      txTotal: 0,
    });

    act(() =>
      socket.fire("wg:peers:stats", {
        peers: [live("p2", "i1", false), live("p3", "i2", false)],
      }),
    );
    act(() =>
      socket.fire("wg:peers:stats", { peers: [live("p3", "i2", true)] }),
    );
    expect(api.listWgPeers).toHaveBeenCalledTimes(1);

    api.listWgPeers.mockResolvedValueOnce({
      data: {
        items: [
          { ...peer, isOnline: true },
          { ...peer, id: "p2", isOnline: true },
        ],
        total: 2,
      },
    });
    act(() =>
      socket.fire("wg:peers:stats", { peers: [live("p2", "i1", true)] }),
    );
    await waitFor(() => expect(result.current.peers.items).toHaveLength(2));
  });

  it("фильтр по включённости: выключенный пир уходит из списка включённых", async () => {
    const { result } = renderHook(() => useWgPeersTableVM({ enabled: true }));

    await waitFor(() => expect(result.current.peers.items).toHaveLength(1));

    act(() => socket.fire("wg:peer:updated", { ...peer, enabled: false }));
    expect(result.current.peers.items).toHaveLength(0);
  });

  it("все пиры — комната списка; обзор — только при праве на статистику", async () => {
    iocContainer
      .rebind(IUserStore.Tid)
      .toConstantValue(
        createFakeAccess({ permissions: [WG_PERMISSIONS.PEER_VIEW] }),
      );

    renderHook(() => useWgPeersTableVM({}));

    await waitFor(() =>
      expect(
        socket.emitted
          .filter(({ event }) => event === "room:subscribe")
          .map(({ args }) => (args[0] as { type: string }).type),
      ).toEqual(["wg-peers"]),
    );
  });

  it("созданный собой пир с чужим держателем — свой: попадает в список", async () => {
    iocContainer.rebind(IUserStore.Tid).toConstantValue(
      createFakeAccess({
        permissions: [ownPermission(WG_PERMISSIONS.PEER_VIEW)],
      }),
    );
    const created = { ...peer, id: "p2", userId: "u2", createdById: "u1" };

    const { result } = renderHook(() => useWgPeersTableVM({}));

    await waitFor(() => expect(result.current.peers.items).toHaveLength(1));
    api.listWgPeers.mockResolvedValueOnce({
      data: { items: [peer, created], total: 2 },
    });

    act(() => socket.fire("wg:peer:updated", created));
    await waitFor(() => expect(result.current.peers.items).toHaveLength(2));
  });

  it("видит все — меняет и удаляет только свои", () => {
    iocContainer.rebind(IUserStore.Tid).toConstantValue(
      createFakeAccess({
        permissions: [
          WG_PERMISSIONS.PEER_VIEW,
          ownPermission(WG_PERMISSIONS.PEER_UPDATE),
          ownPermission(WG_PERMISSIONS.PEER_DELETE),
        ],
      }),
    );

    const { result } = renderHook(() => useWgPeersTableVM({}));
    const own = { ...peer, userId: null, createdById: "u1" };
    const foreign = { ...peer, userId: "u2", createdById: "u3" };

    expect(result.current.canViewAll).toBe(true);
    expect(result.current.accessOf(own)).toEqual({
      canUpdate: true,
      canDelete: true,
      canPsk: false,
      canToggle: false,
    });
    expect(result.current.accessOf(foreign)).toEqual({
      canUpdate: false,
      canDelete: false,
      canPsk: false,
      canToggle: false,
    });
  });
});
