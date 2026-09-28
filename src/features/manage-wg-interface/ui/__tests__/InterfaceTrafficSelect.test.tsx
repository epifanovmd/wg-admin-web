import { TooltipProvider } from "@radix-ui/react-tooltip";
import type { WgInterfaceDto } from "@shared/api/gen/main/model";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { InterfaceTrafficSelect } from "../InterfaceTrafficSelect";

const iface = {
  id: "i1",
  nodeId: "nl",
  nodeName: "Нидерланды",
  nodeStatus: "online",
  status: "up",
  statusMessage: null,
  replicas: [
    {
      nodeId: "kz",
      nodeName: "Алматы",
      nodeStatus: "created",
      priority: 1,
      status: "unknown",
      statusMessage: null,
    },
  ],
  activeReplicaNodeId: null,
} as unknown as WgInterfaceDto;

describe("InterfaceTrafficSelect", () => {
  it("неподнятую копию закрепить нельзя — вариант неактивен", () => {
    render(
      <TooltipProvider>
        <InterfaceTrafficSelect iface={iface} onPin={vi.fn()} />
      </TooltipProvider>,
    );

    fireEvent.keyDown(screen.getByLabelText("Трафик через копию"), {
      key: "ArrowDown",
    });

    const option = screen.getByRole("option", {
      name: "Только Алматы",
    });

    expect(option.getAttribute("aria-disabled")).toBe("true");
    expect(
      screen
        .getByRole("option", { name: "Только Нидерланды" })
        .getAttribute("aria-disabled"),
    ).not.toBe("true");
  });
});
