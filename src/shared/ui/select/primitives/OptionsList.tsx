import { useInfiniteScrollSentinel } from "@shared/lib/hooks";
import { cn } from "@shared/lib/utils";
import * as React from "react";

import { Spinner } from "../../spinner";
import { selectGroupLabelClasses } from "../select-variants";
import type {
  OptionRenderer,
  SelectOption,
  SelectOptionGroup,
  SelectValue,
  SelectVirtualConfig,
} from "../types";
import {
  buildOptionRows,
  getVisibleGroups,
  mapNavIndexToRow,
  type OptionRow,
} from "../utils/option-rows";
import { SelectCreateItem } from "./SelectCreateItem";
import { SelectEmpty } from "./SelectEmpty";
import { SelectListGroup } from "./SelectListGroup";
import { SelectListItem } from "./SelectListItem";
import { SelectLoading } from "./SelectLoading";
import { SelectVirtualItems } from "./SelectVirtualItems";

export interface OptionsListProps<V extends SelectValue> {
  id?: string;
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  error?: unknown;
  options: SelectOption<V>[];
  /** Группы для отображения; индексы опций считаются по `options`. */
  groups?: SelectOptionGroup<V>[];
  multi: boolean;
  empty?: React.ReactNode;
  errorContent?: React.ReactNode;
  optionRender?: OptionRenderer<V>;
  /** Подсвеченный навигационный индекс (опция: индекс + `optionOffset`). */
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
  isSelected: (v: V) => boolean;
  onSelect: (v: V) => void;
  /** id пункта по навигационному индексу. */
  getOptionId: (index: number) => string;
  listRef: React.RefObject<HTMLDivElement | null>;
  onScrollEnd?: () => void;
  className?: string;
  maxHeight?: number;
  /** Содержимое пункта «Создать»; `undefined` — пункта нет. */
  createContent?: React.ReactNode;
  onCreate?: () => void;
  /** Сдвиг навигационных индексов опций (1 при пункте «Создать»). */
  optionOffset?: number;
  virtual?: boolean | SelectVirtualConfig;
  /** Регистрация прокрутки виртуального списка для клавиатуры и ref-API. */
  scrollToIndexRef?: React.RefObject<((index: number) => void) | null>;
}

const DEFAULT_MAX_HEIGHT = 240;
const DEFAULT_VIRTUAL_ITEM_SIZE = 32;
const DEFAULT_VIRTUAL_OVERSCAN = 8;

const LIST_CLASS = "overflow-y-auto p-1";

/** Догрузка стартует чуть раньше, чем sentinel доедет до края списка. */
const SENTINEL_ROOT_MARGIN = "48px";

const resolveVirtual = (
  virtual: OptionsListProps<SelectValue>["virtual"],
): Required<SelectVirtualConfig> | null => {
  if (!virtual) return null;
  const config = virtual === true ? {} : virtual;

  return {
    estimateSize: config.estimateSize ?? DEFAULT_VIRTUAL_ITEM_SIZE,
    overscan: config.overscan ?? DEFAULT_VIRTUAL_OVERSCAN,
  };
};

/**
 * Скроллируемый список опций с состояниями loading / error / empty /
 * items / loadingMore, догрузкой по sentinel-элементу, пунктом «Создать»
 * и опциональной виртуализацией.
 */
export const OptionsList = <V extends SelectValue>({
  id,
  loading,
  loadingMore,
  hasMore,
  error,
  options,
  groups,
  multi,
  empty,
  errorContent = "Не удалось загрузить",
  optionRender,
  focusedIndex,
  setFocusedIndex,
  isSelected,
  onSelect,
  getOptionId,
  listRef,
  onScrollEnd,
  className,
  maxHeight = DEFAULT_MAX_HEIGHT,
  createContent,
  onCreate,
  optionOffset = 0,
  virtual,
  scrollToIndexRef,
}: OptionsListProps<V>): React.ReactElement => {
  const hasCreate = createContent !== undefined;
  const virtualConfig = resolveVirtual(virtual);
  const isVirtual = virtualConfig !== null;

  const selectByNavIndex = React.useCallback(
    (navIndex: number) => {
      const option = options[navIndex - optionOffset];

      if (option) onSelect(option.value);
    },
    [options, onSelect, optionOffset],
  );

  const focusCreate = React.useCallback(
    () => setFocusedIndex(0),
    [setFocusedIndex],
  );

  const showSentinel = !!onScrollEnd && !loading && options.length > 0;

  const sentinelRef = useInfiniteScrollSentinel<HTMLDivElement>({
    rootRef: listRef,
    hasNextPage: showSentinel && hasMore !== false,
    isFetchingNextPage: !!loadingMore,
    onLoadMore: () => onScrollEnd?.(),
    rootMargin: SENTINEL_ROOT_MARGIN,
  });

  const style = React.useMemo(() => ({ maxHeight }), [maxHeight]);

  const indexByValue = React.useMemo(() => {
    const map = new Map<V, number>();

    options.forEach((option, index) => map.set(option.value, index));

    return map;
  }, [options]);

  const rows = React.useMemo(
    () =>
      isVirtual
        ? buildOptionRows(options, indexByValue, groups, hasCreate)
        : [],
    [isVirtual, options, indexByValue, groups, hasCreate],
  );

  const rowByNavIndex = React.useMemo(
    () => mapNavIndexToRow(rows, optionOffset),
    [rows, optionOffset],
  );

  const renderOption = (option: SelectOption<V>, index: number) => {
    const navIndex = index + optionOffset;
    const selected = isSelected(option.value);
    const focused = navIndex === focusedIndex;
    const disabled = !!option.disabled;
    const content = optionRender
      ? optionRender({ option, index, selected, focused, disabled })
      : option.label;

    return (
      <SelectListItem
        key={option.value}
        id={getOptionId(navIndex)}
        index={navIndex}
        selected={selected}
        focused={focused}
        disabled={disabled}
        onSelect={selectByNavIndex}
        onFocus={setFocusedIndex}
        setSize={isVirtual ? options.length : undefined}
        posInSet={isVirtual ? index + 1 : undefined}
      >
        {content}
      </SelectListItem>
    );
  };

  const renderByValue = (option: SelectOption<V>) =>
    renderOption(option, indexByValue.get(option.value) ?? -1);

  const createItem = hasCreate && (
    <SelectCreateItem
      id={getOptionId(0)}
      focused={focusedIndex === 0}
      onSelect={onCreate}
      onFocus={focusCreate}
    >
      {createContent}
    </SelectCreateItem>
  );

  const renderRow = (row: OptionRow<V>) => {
    if (row.kind === "create") return createItem;
    if (row.kind === "group") {
      return (
        <div role="presentation" className={selectGroupLabelClasses}>
          {row.label}
        </div>
      );
    }

    return renderOption(row.option, row.index);
  };

  const renderItems = () => {
    if (virtualConfig) {
      return (
        <SelectVirtualItems<V>
          rows={rows}
          renderRow={renderRow}
          focusedRow={rowByNavIndex.get(focusedIndex) ?? -1}
          rowByNavIndex={rowByNavIndex}
          scrollElementRef={listRef}
          scrollToIndexRef={scrollToIndexRef}
          estimateSize={virtualConfig.estimateSize}
          overscan={virtualConfig.overscan}
        />
      );
    }

    if (!groups) {
      return (
        <>
          {createItem}
          {options.map(renderOption)}
        </>
      );
    }

    // В группах показываются только опции из `options` (после фильтрации).
    return (
      <>
        {createItem}
        {getVisibleGroups(groups, indexByValue).map(group => (
          <SelectListGroup key={group.group} label={group.group}>
            {group.options.map(renderByValue)}
          </SelectListGroup>
        ))}
      </>
    );
  };

  const renderContent = () => {
    if (loading) return <SelectLoading />;
    if (error) return <SelectEmpty>{errorContent}</SelectEmpty>;
    if (options.length === 0 && !hasCreate) {
      return <SelectEmpty>{empty}</SelectEmpty>;
    }

    return renderItems();
  };

  return (
    <div
      ref={listRef}
      id={id}
      className={cn(LIST_CLASS, className)}
      style={style}
      role="listbox"
      aria-multiselectable={multi}
    >
      {renderContent()}
      {loadingMore && (
        <div className="flex items-center justify-center py-2">
          <Spinner size="sm" />
        </div>
      )}
      {showSentinel && <div ref={sentinelRef} aria-hidden className="h-px" />}
    </div>
  );
};
