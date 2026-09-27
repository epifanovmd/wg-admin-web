import type * as React from "react";

import type { SelectValue, TagRenderInfo } from "../types";
import {
  SelectSearchInput,
  type SelectSearchInputProps,
} from "./SelectSearchInput";
import { SelectTagsValue } from "./SelectTagsValue";
import { SelectTextValue } from "./SelectTextValue";

export interface SelectTriggerContentProps<V extends SelectValue> {
  multi: boolean;
  tagsDisplay: boolean;
  search: boolean;
  open: boolean;
  query: string;
  placeholder?: string;
  disabled?: boolean;
  selectedValues: V[];
  getLabel: (value: V) => string;
  renderValue?: (info: { values: V[]; labels: string[] }) => React.ReactNode;
  tagRender?: (info: TagRenderInfo<V>) => React.ReactNode;
  onRemoveTag: (value: V) => void;
  maxTagCount?: number;
  /** Пропсы поискового инпута (ref, id, aria-*, onChange, onKeyDown). */
  searchInputProps?: SelectSearchInputProps & {
    ref?: React.Ref<HTMLInputElement>;
  };
}

/** Содержимое триггера: теги, текст значения или поисковый инпут. */
export const SelectTriggerContent = <V extends SelectValue>({
  multi,
  tagsDisplay,
  search,
  open,
  query,
  placeholder,
  disabled,
  selectedValues,
  getLabel,
  renderValue,
  tagRender,
  onRemoveTag,
  maxTagCount,
  searchInputProps,
}: SelectTriggerContentProps<V>): React.ReactElement => {
  const hasValue = selectedValues.length > 0;
  const labels = selectedValues.map(getLabel);
  const text = hasValue ? labels.join(", ") : undefined;

  if (multi && tagsDisplay) {
    if (!search && !hasValue) {
      return <SelectTextValue muted>{placeholder}</SelectTextValue>;
    }

    return (
      <SelectTagsValue<V>
        values={selectedValues}
        labels={labels}
        disabled={disabled}
        maxTagCount={maxTagCount}
        tagRender={tagRender}
        onRemoveTag={onRemoveTag}
      >
        {search && (
          <SelectSearchInput
            {...searchInputProps}
            value={open ? query : ""}
            placeholder={hasValue ? undefined : placeholder}
          />
        )}
      </SelectTagsValue>
    );
  }

  if (search) {
    const inputValue = open ? query : (text ?? "");
    const closedPlaceholder = hasValue ? undefined : placeholder;
    const inputPlaceholder = open ? (text ?? placeholder) : closedPlaceholder;

    return (
      <SelectSearchInput
        {...searchInputProps}
        value={inputValue}
        placeholder={inputPlaceholder}
      />
    );
  }

  const valueNode = renderValue
    ? renderValue({ values: selectedValues, labels })
    : text;

  return (
    <SelectTextValue muted={!hasValue}>
      {valueNode ?? placeholder}
    </SelectTextValue>
  );
};
