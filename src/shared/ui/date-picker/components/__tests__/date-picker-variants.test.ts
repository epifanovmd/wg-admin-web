import { fieldVariants } from "../../../foundation";
import { datePickerTriggerVariants } from "../date-picker-variants";

describe("datePickerTriggerVariants", () => {
  it("строится на общей оболочке поля с фокусом внутри", () => {
    expect(datePickerTriggerVariants()).toContain(
      fieldVariants({ focusMode: "within" }),
    );
    expect(datePickerTriggerVariants({ size: "lg" })).toContain("h-12");
  });

  it("подсвечивает открытый попап кольцом своего варианта", () => {
    expect(datePickerTriggerVariants()).toContain(
      "data-[state=open]:shadow-focus",
    );
    expect(datePickerTriggerVariants({ variant: "error" })).toContain(
      "data-[state=open]:shadow-focus-error",
    );
  });
});
