import {
  FIELD_BASE,
  FIELD_FOCUS_MODE_VARIANTS,
  FIELD_SIZE_VARIANTS,
  FIELD_VARIANT_MAP,
  fieldVariants,
} from "../field-variants";

describe("fieldVariants", () => {
  it("owns the shared geometry, sizing and colors of field controls", () => {
    expect(FIELD_BASE).toContain("w-full");
    expect(FIELD_BASE).toContain("rounded-lg");
    expect(FIELD_BASE).toContain("px-3");
    expect(FIELD_BASE).toContain("py-2");
    expect(FIELD_SIZE_VARIANTS.sm).toContain("h-8");
    expect(FIELD_SIZE_VARIANTS.md).toContain("h-10");
    expect(FIELD_SIZE_VARIANTS.lg).toContain("h-12");
    expect(FIELD_VARIANT_MAP.default).toContain("border-border");
    expect(FIELD_VARIANT_MAP.error).toContain("border-destructive");
    expect(FIELD_VARIANT_MAP.success).toContain("border-success");
  });

  it("uses self focus for native controls", () => {
    const classes = fieldVariants({ focusMode: "self", variant: "error" });

    expect(classes).toContain(FIELD_FOCUS_MODE_VARIANTS.self);
    expect(classes).toContain("focus-visible:shadow-focus-error");
    expect(classes).not.toContain("focus-within:");
  });

  it("uses descendant focus for composite controls", () => {
    const classes = fieldVariants({ focusMode: "within", variant: "filled" });

    expect(classes).toContain(FIELD_FOCUS_MODE_VARIANTS.within);
    expect(classes).toContain("focus-within:bg-muted/70");
    expect(classes).toContain("focus-within:shadow-focus");
    expect(classes).not.toContain("focus-visible:");
  });

  it("keeps the focus appearance while a popup field is open", () => {
    const classes = fieldVariants({ focusMode: "open", variant: "success" });

    expect(classes).toContain(FIELD_FOCUS_MODE_VARIANTS.open);
    expect(classes).toContain("focus-visible:shadow-focus-success");
    expect(classes).toContain("data-[state=open]:shadow-focus-success");
  });
});
