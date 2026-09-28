import { TooltipProvider } from "@radix-ui/react-tooltip";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AgentUpdateButton } from "../AgentUpdateButton";

const release = { version: "2.1.0", hashes: { amd64: "new", arm64: "arm" } };
const node = (patch = {}) => ({
  agentVersion: "2.0.0",
  agentCodeHash: "old",
  osInfo: { arch: "amd64" },
  ...patch,
});

describe("AgentUpdateButton", () => {
  const renderButton = (props: Parameters<typeof AgentUpdateButton>[0]) =>
    render(
      <TooltipProvider>
        <AgentUpdateButton {...props} />
      </TooltipProvider>,
    );

  it("доступно обновление — кнопка вызывает onUpdate", () => {
    const onUpdate = vi.fn();

    renderButton({ node: node(), release, onUpdate });
    fireEvent.click(screen.getByText("Обновить агента"));
    expect(onUpdate).toHaveBeenCalledOnce();
  });

  it("обновления нет — кнопки нет", () => {
    const { container } = renderButton({
      node: node({ agentCodeHash: "new" }),
      release,
      onUpdate: vi.fn(),
    });

    expect(container.textContent).toBe("");
  });
});
