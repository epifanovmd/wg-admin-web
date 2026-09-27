import { useMergedRef } from "@mantine/hooks";
import { useControllableState } from "@shared/lib/hooks";
import { cn } from "@shared/lib/utils";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";
import * as React from "react";

import { FieldClearButton } from "../foundation";

export interface CommandInputProps extends React.ComponentPropsWithoutRef<
  typeof CommandPrimitive.Input
> {
  /** Показывать кнопку очистки, пока поле не пустое. */
  clearable?: boolean;
  /** Классы обёртки с иконкой поиска. */
  wrapperClassName?: string;
}

const WRAPPER_CLASS = "flex items-center gap-2 border-b border-border px-3";
const ICON_CLASS = "size-4 shrink-0 text-muted-foreground";
const INPUT_CLASS =
  "flex h-11 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50";

/** Поле поиска панели: иконка слева, очистка справа; controlled и uncontrolled. */
const CommandInput = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Input>,
  CommandInputProps
>(
  (
    {
      className,
      wrapperClassName,
      value,
      onValueChange,
      clearable = true,
      placeholder = "Поиск…",
      ...props
    },
    ref,
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const mergedRef = useMergedRef(ref, inputRef);
    const [search, setSearch] = useControllableState({
      value,
      defaultValue: "",
      onChange: onValueChange,
    });

    const handleClear = () => {
      setSearch("");
      inputRef.current?.focus();
    };

    const showClear = clearable && search !== "";

    return (
      <div className={cn(WRAPPER_CLASS, wrapperClassName)}>
        <Search aria-hidden className={ICON_CLASS} />
        <CommandPrimitive.Input
          ref={mergedRef}
          value={search}
          onValueChange={setSearch}
          placeholder={placeholder}
          className={cn(INPUT_CLASS, className)}
          {...props}
        />
        {showClear && <FieldClearButton onClear={handleClear} />}
      </div>
    );
  },
);

CommandInput.displayName = "CommandInput";

export { CommandInput };
