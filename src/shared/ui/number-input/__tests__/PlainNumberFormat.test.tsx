import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PLAIN_NUMBER_FORMAT } from "../number-format";
import { NumberInput } from "../NumberInput";

describe("PLAIN_NUMBER_FORMAT", () => {
  it("порт без разделителя разрядов: 51820, а не «51 820»", () => {
    render(
      <NumberInput
        aria-label="Порт"
        value={51820}
        formatOptions={PLAIN_NUMBER_FORMAT}
        onValueChange={() => undefined}
      />,
    );

    expect((screen.getByLabelText("Порт") as HTMLInputElement).value).toBe(
      "51820",
    );
  });
});
