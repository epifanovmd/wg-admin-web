import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WG_RX_COLOR, WG_TX_COLOR } from "../../lib/colors";
import { WgRxTx } from "../WgRxTx";

describe("WgRxTx", () => {
  it("приём и отдача — в цветах серий графика скорости", () => {
    render(<WgRxTx rx="135 Мбит/с" tx="2.5 Мбит/с" />);

    expect(screen.getByText("↓ 135 Мбит/с").style.color).toBe(WG_RX_COLOR);
    expect(screen.getByText("↑ 2.5 Мбит/с").style.color).toBe(WG_TX_COLOR);
  });
});
