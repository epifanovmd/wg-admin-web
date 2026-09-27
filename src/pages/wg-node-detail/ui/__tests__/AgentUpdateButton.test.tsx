import { TooltipProvider } from "@radix-ui/react-tooltip";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { resolveAgentUpdate } from "../../model/agent-update";
import { AgentUpdateButton } from "../AgentUpdateButton";

const release = { version: "2.1.0", hashes: { amd64: "new", arm64: "arm" } };
const node = (patch = {}) => ({
  agentVersion: "2.0.0",
  agentCodeHash: "old",
  osInfo: { arch: "amd64" },
  ...patch,
});

describe("resolveAgentUpdate", () => {
  it("бинарь ноды отличается от релиза её архитектуры — обновление", () => {
    expect(resolveAgentUpdate(node(), release)).toBe("available");
    expect(
      resolveAgentUpdate(
        node({ osInfo: { arch: "arm64" }, agentCodeHash: "arm" }),
        release,
      ),
    ).toBe("none");
  });

  it("версия агента не важна — сравнивается бинарь", () => {
    expect(resolveAgentUpdate(node({ agentVersion: "1.0.0" }), release)).toBe(
      "available",
    );
  });

  it("архитектура — только amd64 и arm64, как их сообщает агент", () => {
    expect(resolveAgentUpdate(node({ osInfo: { arch: "x64" } }), release)).toBe(
      "none",
    );
  });

  it("актуален, нет релиза, неизвестна архитектура или агент не отчитался", () => {
    expect(resolveAgentUpdate(node({ agentCodeHash: "new" }), release)).toBe(
      "none",
    );
    expect(resolveAgentUpdate(node(), { version: null, hashes: {} })).toBe(
      "none",
    );
    expect(resolveAgentUpdate(node(), null)).toBe("none");
    expect(resolveAgentUpdate(node({ osInfo: null }), release)).toBe("none");
    expect(resolveAgentUpdate(node({ agentVersion: null }), release)).toBe(
      "none",
    );
  });
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
