import { fireEvent, render, screen } from "@testing-library/react";

import { MaskedInput } from "../MaskedInput";
import { phoneMask } from "../masks";

const FREE_TEXT = { mask: /^.*$/ };

describe("MaskedInput", () => {
  it.each(["masked", "unmasked"] as const)(
    "сбрасывает поле при внешнем value='' (valueMode=%s)",
    valueMode => {
      const view = render(
        <MaskedInput
          aria-label="Поле"
          mask={FREE_TEXT}
          value="abc"
          valueMode={valueMode}
        />,
      );

      const input = screen.getByRole("textbox", { name: "Поле" });

      expect(input).toHaveValue("abc");

      view.rerender(
        <MaskedInput
          aria-label="Поле"
          mask={FREE_TEXT}
          value=""
          valueMode={valueMode}
        />,
      );

      expect(input).toHaveValue("");
    },
  );

  it("отдаёт masked и unmasked значения при вводе", () => {
    const onChange = vi.fn();

    render(
      <MaskedInput aria-label="Телефон" mask={phoneMask} onChange={onChange} />,
    );

    fireEvent.input(screen.getByRole("textbox", { name: "Телефон" }), {
      target: { value: "9001234567" },
    });

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        unmaskedValue: expect.stringContaining("9001234567"),
      }),
    );
  });
});
