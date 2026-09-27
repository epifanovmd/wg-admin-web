import { cn } from "@shared/lib/utils";
import * as React from "react";

import type { FieldProps } from "../types";
import { FieldLabel } from "./FieldLabel";

export type { FieldProps };

export type FieldElementProps = FieldProps &
  React.HTMLAttributes<HTMLDivElement>;

const ROOT_CLASS = "flex flex-col gap-1.5";
const OUTSIDE_LABEL_ROW_CLASS = "flex min-h-[1.25rem] items-center gap-1.5";
const FLOATING_CONTROL_CLASS = cn(
  "group/floating relative",
  "[&_[data-slot=input]]:h-14 [&_[data-slot=input]]:pt-6 [&_[data-slot=input]]:pb-1.5",
  "[&_textarea[data-slot=input]]:h-auto [&_textarea[data-slot=input]]:min-h-14",
  "[&_[data-slot=input]]:placeholder:opacity-0 [&_[data-slot=input]]:placeholder:transition-opacity [&_[data-slot=input]]:placeholder:duration-200",
  "focus-within:[&_[data-slot=input]]:placeholder:opacity-100",
  "[&:has([data-size=sm])_[data-slot=input]]:h-12 [&:has([data-size=sm])_[data-slot=input]]:pt-5 [&:has([data-size=sm])_[data-slot=input]]:pb-1",
  "[&:has([data-size=lg])_[data-slot=input]]:h-16 [&:has([data-size=lg])_[data-slot=input]]:pt-7 [&:has([data-size=lg])_[data-slot=input]]:pb-2",
  "[&_[data-slot=input-left-icon]]:top-[62%] [&_[data-slot=input-left-addon]]:top-[62%] [&_[data-slot=input-actions]]:top-[62%]",
);
const FLOATING_LABEL_CONTAINER_CLASS = cn(
  "absolute left-3 top-1/2 z-10 flex -translate-y-1/2 items-center gap-1.5 transition-all duration-200",
  "group-focus-within/floating:top-2 group-focus-within/floating:translate-y-0",
  "group-has-[[data-has-value=true]]/floating:top-2 group-has-[[data-has-value=true]]/floating:translate-y-0",
  "group-has-[textarea]/floating:top-2 group-has-[textarea]/floating:translate-y-0",
  "group-has-[[data-size=sm]]/floating:left-2 group-has-[[data-size=lg]]/floating:left-4",
  "group-has-[[data-slot=input-left-icon]]/floating:left-10 group-has-[[data-slot=input-left-addon]]/floating:left-10",
  "group-has-[:disabled]/floating:opacity-50",
);
const DESCRIPTION_CLASS = "text-xs leading-tight text-muted-foreground";
const ERROR_CLASS = "text-xs leading-tight text-destructive";

/**
 * Обёртка контрола: подпись (снаружи или floating), подсказка, описание и
 * ошибка. Описание идёт до ошибки — в том же порядке, что и `aria-describedby`.
 */
export const Field = React.forwardRef<HTMLDivElement, FieldElementProps>(
  (
    {
      label,
      labelPlacement = "outside",
      hint,
      description,
      error,
      required,
      htmlFor,
      labelId,
      descriptionId,
      errorId,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const hasLabel = label !== undefined;
    const isFloating = labelPlacement === "floating" && hasLabel;
    const labelContent = hasLabel && (
      <FieldLabel
        label={label}
        htmlFor={htmlFor}
        labelId={labelId}
        required={required}
        hint={hint}
        floating={isFloating}
      />
    );

    const control = isFloating ? (
      <div className={FLOATING_CONTROL_CLASS} data-slot="field-control">
        {children}
        <div
          className={FLOATING_LABEL_CONTAINER_CLASS}
          data-slot="field-label-container"
        >
          {labelContent}
        </div>
      </div>
    ) : (
      <>
        {labelContent && (
          <div className={OUTSIDE_LABEL_ROW_CLASS}>{labelContent}</div>
        )}
        {children}
      </>
    );

    return (
      <div
        ref={ref}
        className={cn(ROOT_CLASS, className)}
        data-label-placement={isFloating ? "floating" : "outside"}
        data-slot="field"
        {...props}
      >
        {control}
        {description !== undefined && (
          <p id={descriptionId} className={DESCRIPTION_CLASS}>
            {description}
          </p>
        )}
        {error && (
          <p id={errorId} role="alert" className={ERROR_CLASS}>
            {error}
          </p>
        )}
      </div>
    );
  },
);

Field.displayName = "Field";
