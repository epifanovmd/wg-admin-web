import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CopyButton } from "../CopyButton";

afterEach(() => vi.restoreAllMocks());

describe("CopyButton", () => {
  it("копирует текст, показывает «Скопировано» и сообщает onCopied; сам текст не выводит", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const onCopied = vi.fn();

    Object.assign(navigator, { clipboard: { writeText } });
    render(<CopyButton text={"A=1\nB=2"} onCopied={onCopied} />);

    expect(screen.getByRole("button")).toHaveTextContent("Скопировать");
    expect(screen.queryByText(/A=1/)).toBeNull();

    await act(async () => {
      fireEvent.click(screen.getByRole("button"));
    });

    expect(writeText).toHaveBeenCalledWith("A=1\nB=2");
    expect(screen.getByRole("button")).toHaveTextContent("Скопировано");
    expect(onCopied).toHaveBeenCalledOnce();
  });
});
