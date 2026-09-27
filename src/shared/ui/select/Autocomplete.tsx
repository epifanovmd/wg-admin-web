import { useMergedRef } from "@mantine/hooks";
import { useEvent } from "@shared/lib/hooks";
import type { FactoryOpts } from "imask";
import * as React from "react";

import { type MaskedInputChangeInfo, useMaskedInput } from "../masked-input";
import { useSelectEngine } from "./hooks";
import {
  OptionsList,
  SelectDropdown,
  SelectSearchInput,
  SelectTriggerBase,
} from "./primitives";
import type { AutocompleteProps, SelectRef } from "./types";

const FREE_TEXT_MASK: FactoryOpts = { mask: /^.*$/ };

const AutocompleteInner = <V extends string = string>(
  props: AutocompleteProps<V>,
  ref: React.ForwardedRef<SelectRef>,
) => {
  const {
    options,
    mask = FREE_TEXT_MASK,
    loading,
    loadingMore,
    hasMore,
    error,
    onSearch,
    onScrollEnd,
    open: openProp,
    onOpenChange,
    disabled,
    placeholder,
    empty,
    errorContent,
    optionRender,
    virtual,
    hideEmpty = true,
    closeOnClear = false,
    onSelect,
    onFocus,
    onBlur,
    value,
    onChange,
    clearable = true,
    size,
    variant,
    valid,
    className,
    id,
    name,
    listClassName,
    maxHeight,
    dropdownSide,
    dropdownAlign,
    dropdownSideOffset,
    dropdownAlignOffset,
    dropdownAvoidCollisions,
    dropdownCollisionPadding,
    dropdownWidth,
    dropdownMaxWidth,
    dropdownContainer,
    "aria-label": ariaLabel,
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    "aria-labelledby": ariaLabelledBy,
    "aria-required": ariaRequired,
  } = props;

  const text = value ?? "";

  const handleEngineChange = useEvent((next: V | V[] | null) => {
    onChange?.(next == null ? "" : String(next));
  });

  const engine = useSelectEngine<V>({
    ref,
    options,
    multi: false,
    value: text === "" ? null : (text as V),
    onChange: handleEngineChange,
    onSelect,
    open: openProp,
    onOpenChange,
    closeOnClear,
    searchable: true,
  });

  const handleInputChange = (info: MaskedInputChangeInfo<FactoryOpts>) => {
    onSearch?.(info.value);
    onChange?.(info.unmaskedValue);
    // Печать в закрытый список (фокус через Tab) открывает его; программная
    // синхронизация значения (выбор опции, reset формы) — нет.
    if (info.event && info.value !== "" && !engine.open)
      engine.handleOpen(true);
  };

  const { ref: maskRef, value: displayValue } = useMaskedInput<FactoryOpts>({
    mask,
    value: text,
    valueMode: "unmasked",
    disabled,
    onChange: handleInputChange,
  });

  const mergedInputRef = useMergedRef(engine.inputRef, maskRef);

  const showClear = clearable && !loading && !disabled && displayValue !== "";
  const hidden = hideEmpty && !loading && !error && options.length === 0;

  return (
    <>
      {name && <input type="hidden" name={name} value={text} />}
      <SelectDropdown
        open={engine.open}
        onOpenChange={engine.handleOpen}
        hidden={hidden}
        closeOnTriggerClick={false}
        dropdownSide={dropdownSide}
        dropdownAlign={dropdownAlign}
        dropdownSideOffset={dropdownSideOffset}
        dropdownAlignOffset={dropdownAlignOffset}
        dropdownAvoidCollisions={dropdownAvoidCollisions}
        dropdownCollisionPadding={dropdownCollisionPadding}
        dropdownWidth={dropdownWidth}
        dropdownMaxWidth={dropdownMaxWidth}
        dropdownContainer={dropdownContainer}
        trigger={
          <SelectTriggerBase
            ref={engine.triggerRef}
            size={size}
            variant={variant}
            valid={valid}
            className={className}
            loading={loading}
            showClear={showClear}
            onClear={engine.clear}
            disabled={disabled}
            cursorText
            hideChevron
            onFocus={onFocus}
            onBlur={onBlur}
          >
            <SelectSearchInput
              ref={mergedInputRef}
              id={id}
              placeholder={placeholder}
              disabled={disabled}
              role="combobox"
              aria-expanded={engine.open}
              aria-haspopup="listbox"
              aria-controls={engine.open ? engine.listboxId : undefined}
              aria-activedescendant={engine.activeDescendant}
              aria-label={ariaLabel}
              aria-describedby={ariaDescribedBy}
              aria-invalid={ariaInvalid}
              aria-labelledby={ariaLabelledBy}
              aria-required={ariaRequired}
              onKeyDown={engine.handleKeyDown}
            />
          </SelectTriggerBase>
        }
      >
        <OptionsList<V>
          id={engine.listboxId}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          error={error}
          options={options}
          multi={false}
          empty={empty}
          errorContent={errorContent}
          optionRender={optionRender}
          focusedIndex={engine.focusedIndex}
          setFocusedIndex={engine.setFocusedIndex}
          isSelected={engine.isSelected}
          onSelect={engine.select}
          getOptionId={engine.getOptionId}
          listRef={engine.listRef}
          onScrollEnd={onScrollEnd}
          className={listClassName}
          maxHeight={maxHeight}
          virtual={virtual}
          scrollToIndexRef={engine.scrollToIndexRef}
        />
      </SelectDropdown>
    </>
  );
};

const AutocompleteForwarded = React.forwardRef(AutocompleteInner);

AutocompleteForwarded.displayName = "Autocomplete";

export const Autocomplete = AutocompleteForwarded as <
  V extends string = string,
>(
  props: AutocompleteProps<V> & { ref?: React.Ref<SelectRef> },
) => React.ReactElement;
