import type * as React from "react";

import type { SelectValue, TagRenderInfo } from "../types";
import { SelectTag } from "./SelectTag";

export interface SelectTagsValueProps<V extends SelectValue> {
  values: V[];
  labels: string[];
  disabled?: boolean;
  maxTagCount?: number;
  tagRender?: (info: TagRenderInfo<V>) => React.ReactNode;
  onRemoveTag: (value: V) => void;
  /** Поисковый инпут после тегов (search-режим). */
  children?: React.ReactNode;
}

const ROW_CLASS =
  "flex flex-wrap gap-1 flex-1 min-w-0 overflow-hidden items-center py-0.5";

const OVERFLOW_CLASS =
  "inline-flex items-center rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-muted-foreground opacity-60";

/** Теги выбранных значений в multi-режиме с лимитом `maxTagCount`. */
export const SelectTagsValue = <V extends SelectValue>({
  values,
  labels,
  disabled,
  maxTagCount,
  tagRender,
  onRemoveTag,
  children,
}: SelectTagsValueProps<V>) => {
  const visibleCount =
    maxTagCount != null && values.length > maxTagCount
      ? maxTagCount
      : values.length;
  const overflowCount = values.length - visibleCount;

  const renderTag = (value: V, index: number) => {
    const label = labels[index] ?? String(value);
    const onRemove = () => onRemoveTag(value);

    if (tagRender) {
      return (
        <span key={String(value)}>
          {tagRender({ value, label, disabled: !!disabled, onRemove })}
        </span>
      );
    }

    return (
      <SelectTag
        key={String(value)}
        label={label}
        onRemove={onRemove}
        disabled={disabled}
      />
    );
  };

  return (
    <div className={ROW_CLASS}>
      {values.slice(0, visibleCount).map(renderTag)}
      {overflowCount > 0 && (
        <span className={OVERFLOW_CLASS}>+{overflowCount}</span>
      )}
      {children}
    </div>
  );
};
