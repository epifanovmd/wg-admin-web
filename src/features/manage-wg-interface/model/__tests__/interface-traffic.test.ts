import type { WgInterfaceDto } from "@shared/api/gen/main/model";
import { describe, expect, it } from "vitest";

import { interfaceTraffic } from "../interface-traffic";

const iface = (patch: Partial<WgInterfaceDto> = {}) =>
  ({
    nodeId: "a",
    nodeName: "Нидерланды",
    replicas: [{ nodeId: "c", nodeName: "Алматы" }],
    endpoint: {
      name: "msk-relay",
      mode: "relay",
      relayNodeId: "r",
      relayNodeName: "MSK",
    },
    servingNodeId: "c",
    activeReplicaNodeId: null,
    ...patch,
  }) as unknown as WgInterfaceDto;

describe("interfaceTraffic", () => {
  it("через релей: релей, копия с трафиком, авто или закреплено", () => {
    expect(interfaceTraffic(iface())).toEqual({
      kind: "relay",
      relayName: "MSK",
      servingName: "Алматы",
      pinned: false,
    });
    expect(interfaceTraffic(iface({ activeReplicaNodeId: "c" }))).toMatchObject(
      { pinned: true },
    );
  });

  it("релей ещё не отчитался — копия неизвестна", () => {
    expect(interfaceTraffic(iface({ servingNodeId: null }))).toMatchObject({
      kind: "relay",
      servingName: null,
    });
  });

  it("точка «адрес ноды» или без точки, есть копии — копии только резерв", () => {
    expect(
      interfaceTraffic(
        iface({
          endpoint: {
            name: "msk",
            mode: "direct",
            relayNodeId: null,
            relayNodeName: null,
          },
        }),
      ),
    ).toEqual({ kind: "manual", endpointName: "msk" });
    expect(interfaceTraffic(iface({ endpoint: null }))).toEqual({
      kind: "manual",
      endpointName: null,
    });
  });

  it("без релея и без копий — сказать нечего", () => {
    expect(
      interfaceTraffic(iface({ endpoint: null, replicas: [] })),
    ).toBeNull();
  });
});
