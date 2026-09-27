import { describe, expect, it } from "vitest";
import { z } from "zod";

import { createBooleanDiscriminatedUnion } from "../create-boolean-discriminated-union";
import { refineFormField } from "../refine-form-field";

describe("validation helpers", () => {
  it("creates structural boolean branches", () => {
    const fields = z.object({ value: z.string().min(1) });
    const schema = createBooleanDiscriminatedUnion({
      discriminator: "enabled",
      enabled: fields,
      disabled: fields.omit({ value: true }),
    });

    expect(schema.parse({ enabled: true, value: "data" })).toEqual({
      enabled: true,
      value: "data",
    });
    expect(schema.parse({ enabled: false, value: 42 })).toEqual({
      enabled: false,
    });
    expect(schema.safeParse({ enabled: true }).success).toBe(false);
  });

  it("routes a cross-field refinement error to a typed field", () => {
    const schema = refineFormField(
      z.object({ password: z.string(), confirmation: z.string() }),
      {
        field: "confirmation",
        check: values => values.password === values.confirmation,
        message: "Values do not match",
      },
    );
    const result = schema.safeParse({
      password: "first",
      confirmation: "second",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]).toMatchObject({
        path: ["confirmation"],
        message: "Values do not match",
      });
    }
  });
});
