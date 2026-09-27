import type { VariantProps } from "class-variance-authority";
import * as React from "react";

import type { radioVariants } from "./radio-variants";

export type RadioSize = NonNullable<VariantProps<typeof radioVariants>["size"]>;
export type RadioVariant = NonNullable<
  VariantProps<typeof radioVariants>["variant"]
>;

export interface RadioGroupContextValue {
  name: string;
  value: string | undefined;
  onChange: (value: string) => void;
  size?: RadioSize;
  variant?: RadioVariant;
  disabled?: boolean;
}

export const RadioGroupContext =
  React.createContext<RadioGroupContextValue | null>(null);

export const useRadioGroup = () => React.useContext(RadioGroupContext);
