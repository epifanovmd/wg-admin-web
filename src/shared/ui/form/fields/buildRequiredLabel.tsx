import type { ReactNode } from "react";

import { RequiredMark } from "../primitives/RequiredMark";

/** Дополняет подпись звёздочкой обязательного поля, если подпись задана. */
export const buildRequiredLabel = (
  label: ReactNode,
  required: boolean | undefined,
): ReactNode => {
  if (!required || label === undefined) return label;

  return (
    <>
      {label}
      <RequiredMark />
    </>
  );
};
