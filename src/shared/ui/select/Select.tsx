import { useControllableState, useEvent } from "@shared/lib/hooks";
import { cn } from "@shared/lib/utils";
import * as React from "react";

import { useLabelCache, useSelectEngine } from "./hooks";
import {
  OptionsList,
  SelectDropdown,
  SelectTagsValue,
  SelectTriggerBase,
  SelectTriggerButton,
  SelectTriggerContent,
  SelectTriggerIcon,
} from "./primitives";
import type {
  LabeledValue,
  SelectOption,
  SelectProps,
  SelectRef,
  SelectValue,
} from "./types";
import { getOptionText } from "./utils/get-option-text";

type RawValue<V extends SelectValue> =
  V | V[] | LabeledValue<V> | LabeledValue<V>[] | null | undefined;

const toLabeledArray = <V extends SelectValue>(
  value: RawValue<V>,
): LabeledValue<V>[] => {
  if (value == null) return [];

  return (Array.isArray(value) ? value : [value]) as LabeledValue<V>[];
};

const unwrapLabeled = <V extends SelectValue>(
  value: RawValue<V>,
  labelInValue: boolean,
): V | V[] | null | undefined => {
  if (!labelInValue || value == null)
    return value as V | V[] | null | undefined;
  if (Array.isArray(value))
    return (value as LabeledValue<V>[]).map(v => v.value);

  return (value as LabeledValue<V>).value;
};

/** Кнопка рядом с тегами: занимает остаток строки, шеврон прижат вправо. */
const TAGS_TRIGGER_BUTTON_CLASS = "min-w-8 justify-end";

const isPromiseLike = (value: unknown): value is PromiseLike<unknown> =>
  typeof (value as PromiseLike<unknown> | null)?.then === "function";

const defaultCreateLabel = (query: string): React.ReactNode =>
  `Создать «${query}»`;

/** Есть ли опция, чей текст совпадает с запросом без учёта регистра. */
const hasExactOption = <V extends SelectValue>(
  options: SelectOption<V>[],
  query: string,
): boolean => {
  const normalized = query.toLocaleLowerCase();

  return options.some(
    option => getOptionText(option).toLocaleLowerCase() === normalized,
  );
};

/** Скрытые input'ы для нативной формы (по одному на значение). */
const renderHiddenInputs = <V extends SelectValue>(
  name: string,
  values: V[],
): React.ReactNode =>
  values.length === 0 ? (
    <input type="hidden" name={name} value="" />
  ) : (
    values.map(value => (
      <input
        key={String(value)}
        type="hidden"
        name={name}
        value={String(value)}
      />
    ))
  );

const SelectInner = <V extends SelectValue = string>(
  props: SelectProps<V>,
  ref: React.ForwardedRef<SelectRef>,
) => {
  const {
    options,
    groups,
    loading,
    loadingMore,
    hasMore,
    error,
    search = false,
    searchValue,
    onSearch,
    onScrollEnd,
    open: openProp,
    onOpenChange,
    disabled,
    placeholder,
    empty,
    errorContent,
    size,
    variant,
    valid,
    className,
    optionRender,
    renderValue,
    tagRender,
    hideEmpty,
    closeOnClear,
    closeOnTriggerClick,
    creatable = false,
    onCreate,
    createLabel = defaultCreateLabel,
    virtual,
    onSelect,
    onDeselect,
    onFocus,
    onBlur,
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

  const multi = props.multi === true;
  const clearable = props.clearable === true;
  const tagsDisplay = !multi || props.tagsDisplay !== false;
  const labelInValue = props.labelInValue === true;
  const maxTagCount = multi ? props.maxTagCount : undefined;
  const rawValue = props.value as RawValue<V>;
  const rawOnChange = props.onChange as ((value: unknown) => void) | undefined;

  const [query, setQuery] = useControllableState({
    value: searchValue,
    defaultValue: "",
    onChange: onSearch,
  });

  const { getLabel, toLabeled } = useLabelCache<V>(
    options,
    labelInValue ? toLabeledArray(rawValue) : undefined,
  );

  const resolvedValue = React.useMemo(
    () => unwrapLabeled(rawValue, labelInValue),
    [rawValue, labelInValue],
  );

  const handleChange = useEvent((next: V | V[] | null) => {
    if (!labelInValue) {
      rawOnChange?.(next);
    } else if (Array.isArray(next)) {
      rawOnChange?.(next.map(toLabeled));
    } else {
      rawOnChange?.(next == null ? null : toLabeled(next));
    }
  });

  const resetQuery = React.useCallback(() => setQuery(""), [setQuery]);

  const createQuery = query.trim();
  const exactMatch = React.useMemo(
    () => createQuery !== "" && hasExactOption(options, createQuery),
    [options, createQuery],
  );
  const showCreate =
    creatable &&
    search &&
    createQuery !== "" &&
    !exactMatch &&
    !loading &&
    !error;

  const creatingRef = React.useRef(false);
  const selectCreatedRef = React.useRef<(value: V | undefined | void) => void>(
    () => {},
  );

  const handleCreate = useEvent(() => {
    if (!createQuery || creatingRef.current) return;

    const result = onCreate?.(createQuery);

    if (!isPromiseLike(result)) {
      selectCreatedRef.current(result);

      return;
    }

    creatingRef.current = true;
    Promise.resolve(result)
      .then(
        value => selectCreatedRef.current(value as V | undefined),
        () => undefined,
      )
      .finally(() => {
        creatingRef.current = false;
      });
  });

  const engine = useSelectEngine<V>({
    ref,
    options,
    multi,
    value: resolvedValue,
    onChange: handleChange,
    onSelect,
    onDeselect,
    open: openProp,
    onOpenChange,
    closeOnClear,
    searchable: search,
    onSearchReset: resetQuery,
    createItem: showCreate,
    onCreateItem: handleCreate,
  });

  // Созданное значение выбирается, но не переключается: в multi повторное
  // создание уже выбранного не должно его снимать.
  React.useLayoutEffect(() => {
    selectCreatedRef.current = (value: V | undefined | void) => {
      if (value == null) return;
      if (!engine.isSelected(value)) {
        engine.select(value);

        return;
      }
      resetQuery();
      if (!multi) engine.close();
    };
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setQuery(e.target.value);

  const showClear = clearable && !loading && !disabled && engine.hasValue;
  const hidden =
    hideEmpty && !loading && !error && options.length === 0 && !showCreate;

  const comboboxProps = {
    id,
    role: "combobox" as const,
    disabled,
    "aria-expanded": engine.open,
    "aria-haspopup": "listbox" as const,
    "aria-controls": engine.open ? engine.listboxId : undefined,
    "aria-activedescendant": engine.activeDescendant,
    "aria-label": ariaLabel,
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    "aria-labelledby": ariaLabelledBy,
    "aria-required": ariaRequired,
    onKeyDown: engine.handleKeyDown,
  };

  const content = (
    <SelectTriggerContent<V>
      multi={multi}
      tagsDisplay={tagsDisplay}
      search={search}
      open={engine.open}
      query={query}
      placeholder={placeholder}
      disabled={disabled}
      selectedValues={engine.selectedValues}
      getLabel={getLabel}
      renderValue={renderValue}
      tagRender={tagRender}
      onRemoveTag={engine.removeTag}
      maxTagCount={maxTagCount}
      searchInputProps={
        search
          ? {
              ...comboboxProps,
              ref: engine.inputRef,
              onChange: handleSearchChange,
            }
          : undefined
      }
    />
  );

  const triggerClassName = cn(className, multi && tagsDisplay && "h-auto");

  // Теги с кнопками удаления не могут лежать внутри кнопки-триггера:
  // в multi-режиме они стоят в строке рядом, а кнопка занимает остаток.
  const tagsBesideButton = multi && tagsDisplay && engine.hasValue;

  const triggerButton = (
    <SelectTriggerButton
      ref={engine.buttonRef}
      open={engine.open}
      closeOnTriggerClick={closeOnTriggerClick ?? true}
      className={cn(tagsBesideButton && TAGS_TRIGGER_BUTTON_CLASS)}
      {...comboboxProps}
    >
      {!tagsBesideButton && content}
      {!showClear && <SelectTriggerIcon loading={loading} />}
    </SelectTriggerButton>
  );

  const trigger = search ? (
    <SelectTriggerBase
      ref={engine.triggerRef}
      size={size}
      variant={variant}
      valid={valid}
      className={triggerClassName}
      loading={loading}
      showClear={showClear}
      onClear={engine.clear}
      disabled={disabled}
      cursorText
      onFocus={onFocus}
      onBlur={onBlur}
    >
      {content}
    </SelectTriggerBase>
  ) : (
    <SelectTriggerBase
      ref={engine.triggerRef}
      size={size}
      variant={variant}
      valid={valid}
      className={triggerClassName}
      showClear={showClear}
      onClear={engine.clear}
      disabled={disabled}
      hideChevron
      onFocus={onFocus}
      onBlur={onBlur}
    >
      {tagsBesideButton ? (
        <SelectTagsValue<V>
          values={engine.selectedValues}
          labels={engine.selectedValues.map(getLabel)}
          disabled={disabled}
          maxTagCount={maxTagCount}
          tagRender={tagRender}
          onRemoveTag={engine.removeTag}
        >
          {triggerButton}
        </SelectTagsValue>
      ) : (
        triggerButton
      )}
    </SelectTriggerBase>
  );

  return (
    <>
      {name && renderHiddenInputs(name, engine.selectedValues)}
      <SelectDropdown
        open={engine.open}
        onOpenChange={engine.handleOpen}
        hidden={hidden}
        closeOnTriggerClick={closeOnTriggerClick ?? !search}
        triggerMode={search ? "trigger" : "anchor"}
        trigger={trigger}
        dropdownSide={dropdownSide}
        dropdownAlign={dropdownAlign}
        dropdownSideOffset={dropdownSideOffset}
        dropdownAlignOffset={dropdownAlignOffset}
        dropdownAvoidCollisions={dropdownAvoidCollisions}
        dropdownCollisionPadding={dropdownCollisionPadding}
        dropdownWidth={dropdownWidth}
        dropdownMaxWidth={dropdownMaxWidth}
        dropdownContainer={dropdownContainer}
      >
        <OptionsList<V>
          id={engine.listboxId}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          error={error}
          options={options}
          groups={groups}
          multi={multi}
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
          createContent={showCreate ? createLabel(createQuery) : undefined}
          onCreate={handleCreate}
          optionOffset={engine.optionOffset}
          virtual={virtual}
          scrollToIndexRef={engine.scrollToIndexRef}
        />
      </SelectDropdown>
    </>
  );
};

const SelectForwarded = React.forwardRef(SelectInner);

SelectForwarded.displayName = "Select";

export const Select = SelectForwarded as <V extends SelectValue = string>(
  props: SelectProps<V> & { ref?: React.Ref<SelectRef> },
) => React.ReactElement;
