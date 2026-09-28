import { describe, expect, it } from "vitest";

import { endpointWarnings } from "../endpoint-warnings";

const nodes = [
  { id: "msk", name: "MSK", publicHost: "147.45.245.104" },
  { id: "nl", name: "Нидерланды", publicHost: "201.34.146.180" },
];
const target = (patch = {}) => ({
  interfaceId: "i1",
  interfaceName: "wg0",
  nodeId: "nl",
  nodeName: "Нидерланды",
  port: 51820,
  copyNodeIds: [] as string[],
  ...patch,
});

describe("endpointWarnings", () => {
  it("«адрес ноды»: хост — другая нода панели без интерфейсов точки (ручной релей)", () => {
    const [warning] = endpointWarnings(
      { mode: "direct", host: "147.45.245.104", interfaces: [target()] },
      nodes,
    );

    expect(warning).toContain("нода «MSK»");
    expect(warning).toContain("Через релей панели");
  });

  it("«адрес ноды» ведёт на ноду интерфейса — всё верно", () => {
    expect(
      endpointWarnings(
        { mode: "direct", host: "201.34.146.180", interfaces: [target()] },
        nodes,
      ),
    ).toEqual([]);
  });

  it("«адрес ноды» и у интерфейса есть копии — переключения не будет", () => {
    const warnings = endpointWarnings(
      {
        mode: "direct",
        host: "vpn.example.com",
        interfaces: [target({ copyNodeIds: ["kz"] })],
      },
      nodes,
    );

    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain("копии");
  });

  it("релей: хост ведёт не на релей", () => {
    expect(
      endpointWarnings(
        {
          mode: "relay",
          host: "201.34.146.180",
          relayNodeId: "msk",
          interfaces: [target()],
        },
        nodes,
      )[0],
    ).toContain("не на релей");
    expect(
      endpointWarnings(
        {
          mode: "relay",
          host: "147.45.245.104",
          relayNodeId: "msk",
          interfaces: [target({ copyNodeIds: ["kz"] })],
        },
        nodes,
      ),
    ).toEqual([]);
  });

  it("релей — нода одного из интерфейсов точки: сервер не примет (409), подсказка заранее", () => {
    const [warning] = endpointWarnings(
      {
        mode: "relay",
        host: "147.45.245.104",
        relayNodeId: "msk",
        interfaces: [
          target(),
          target({
            interfaceId: "i2",
            nodeId: "msk",
            nodeName: "MSK",
            port: 51821,
          }),
        ],
      },
      nodes,
    );

    expect(warning).toContain("wg0 на «MSK»");
    expect(warning).toContain("отдельную точку");
  });
});
