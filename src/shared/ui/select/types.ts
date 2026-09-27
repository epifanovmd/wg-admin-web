import type { VariantProps } from "class-variance-authority";
import type { FactoryOpts } from "imask";
import type * as React from "react";

import type { selectTriggerVariants } from "./select-variants";

export type SelectValue = string | number;

export interface SelectOption<V extends SelectValue = string> {
  value: V;
  label: React.ReactNode;
  /** Текстовая форма `label` для поиска, триггера и `LabeledValue`,
   *  когда `label` — не строка. */
  textLabel?: string;
  disabled?: boolean;
}

export interface SelectOptionGroup<V extends SelectValue = string> {
  group: string;
  options: SelectOption<V>[];
}

/** Пропсы, которые отдаёт стратегия загрузки и принимает Select. */
export interface SelectDataProps<V extends SelectValue = string> {
  options: SelectOption<V>[];
  loading?: boolean;
  loadingMore?: boolean;
  /** Есть ещё страницы (infinite-стратегия). */
  hasMore?: boolean;
  /** Ошибка последней загрузки. */
  error?: unknown;
  search?: boolean;
  searchValue?: string;
  onSearch?: (query: string) => void;
  onScrollEnd?: () => void;
  onOpenChange?: (open: boolean) => void;
}

// ─── Filter / Render ──────────────────────────────────────────────────────

export type FilterOptionPredicate<V extends SelectValue = string> = (
  query: string,
  option: SelectOption<V>,
) => boolean;

export interface OptionRenderInfo<V extends SelectValue = string> {
  option: SelectOption<V>;
  index: number;
  selected: boolean;
  focused: boolean;
  disabled: boolean;
}

export type OptionRenderer<V extends SelectValue = string> = (
  info: OptionRenderInfo<V>,
) => React.ReactNode;

export interface TagRenderInfo<V extends SelectValue = string> {
  value: V;
  label: string;
  disabled: boolean;
  onRemove: () => void;
}

// ─── LabelInValue ─────────────────────────────────────────────────────────

export interface LabeledValue<V extends SelectValue = string> {
  value: V;
  label?: string;
}

// ─── Ref API ──────────────────────────────────────────────────────────────

export interface SelectRef {
  focus: () => void;
  blur: () => void;
  /** Открыть/закрыть дропдаун программно. */
  open: (open?: boolean) => void;
  scrollTo: (index: number) => void;
  nativeElement: HTMLElement | null;
}

/** @deprecated используйте `SelectRef`. */
export type ISelectRef = SelectRef;

// ─── Dropdown positioning ─────────────────────────────────────────────────

export type DropdownSide = "top" | "right" | "bottom" | "left";
export type DropdownAlign = "start" | "center" | "end";
export type DropdownCollisionPadding =
  number | Partial<Record<DropdownSide, number>>;
export type DropdownWidth = "trigger" | "auto" | number;
export type DropdownMaxWidth = "trigger" | number;

export interface DropdownPlacementProps {
  dropdownSide?: DropdownSide;
  dropdownAlign?: DropdownAlign;
  dropdownSideOffset?: number;
  dropdownAlignOffset?: number;
  dropdownAvoidCollisions?: boolean;
  dropdownCollisionPadding?: DropdownCollisionPadding;
  dropdownWidth?: DropdownWidth;
  dropdownMaxWidth?: DropdownMaxWidth;
  /** Контейнер портала; `null` — рендер без портала. */
  dropdownContainer?: HTMLElement | null;
  /** Класс скроллируемого списка опций. */
  listClassName?: string;
  /** Максимальная высота списка в px (по умолчанию 240). */
  maxHeight?: number;
}

// ─── Creatable / Virtual ──────────────────────────────────────────────────

/** Создание опции из строки поиска. Вернувшееся значение (сразу или через
 *  Promise) выбирается; `undefined` — ничего не выбирать (например, отказ). */
export type SelectCreateHandler<V extends SelectValue = string> = (
  query: string,
) => V | undefined | void | Promise<V | undefined | void>;

export interface SelectVirtualConfig {
  /** Оценка высоты опции в px (по умолчанию 32). */
  estimateSize?: number;
  /** Опций за пределами видимой области (по умолчанию 8). */
  overscan?: number;
}

// ─── Appearance ───────────────────────────────────────────────────────────

export interface SelectTriggerAppearance extends VariantProps<
  typeof selectTriggerVariants
> {
  placeholder?: string;
  className?: string;
  valid?: boolean;
}

interface SelectBaseProps<V extends SelectValue = string>
  extends SelectTriggerAppearance, SelectDataProps<V>, DropdownPlacementProps {
  id?: string;
  /** Имя скрытого input для нативной формы. */
  name?: string;
  /** Доступное имя, когда видимой подписи нет. */
  "aria-label"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-labelledby"?: string;
  "aria-required"?: boolean;
  disabled?: boolean;
  /** Управляемое состояние открытия (вместе с `onOpenChange`). */
  open?: boolean;
  empty?: React.ReactNode;
  /** Контент при `error` (по умолчанию «Не удалось загрузить»). */
  errorContent?: React.ReactNode;
  /** Опции по группам; `options` при этом — плоский список тех же опций. */
  groups?: SelectOptionGroup<V>[];
  optionRender?: OptionRenderer<V>;
  /** Кастомный текст/узел значения в триггере (single и comma-режим). */
  renderValue?: (info: { values: V[]; labels: string[] }) => React.ReactNode;
  /** Кастомный тег в multi-режиме. */
  tagRender?: (info: TagRenderInfo<V>) => React.ReactNode;
  onSelect?: (value: V, option: SelectOption<V>) => void;
  onDeselect?: (value: V, option: SelectOption<V>) => void;
  onFocus?: (e: React.FocusEvent<HTMLElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLElement>) => void;
  /** Скрывать выпадашку, пока нет опций и ничего не грузится
   *  (open флаг всё равно меняется). */
  hideEmpty?: boolean;
  /** Закрывать дропдаун при очистке значения
   *  (по умолчанию: Select — true, Autocomplete — false). */
  closeOnClear?: boolean;
  /** Закрывать открытый дропдаун повторным кликом по триггеру
   *  (по умолчанию: Select — true без поиска и false с поиском,
   *  Autocomplete — false). */
  closeOnTriggerClick?: boolean;
  /** Пункт «Создать «запрос»» над списком, когда поиск не совпадает ни с
   *  одной опцией точно (без учёта регистра). Работает вместе с `search`. */
  creatable?: boolean;
  /** Выбор пункта «Создать»: добавить опцию и вернуть её значение. */
  onCreate?: SelectCreateHandler<V>;
  /** Текст пункта «Создать» (по умолчанию «Создать «запрос»»). */
  createLabel?: (query: string) => React.ReactNode;
  /** Виртуализация длинного списка: в DOM только видимые опции.
   *  Группы отображаются плоско — заголовок группы становится строкой списка. */
  virtual?: boolean | SelectVirtualConfig;
}

// ─── Value modes (discriminated union) ────────────────────────────────────

interface SelectSingleProps<V extends SelectValue = string> {
  multi?: false;
  clearable?: false;
  labelInValue?: false;
  value?: V | null;
  onChange?: (value: V) => void;
}

interface SelectSingleClearableProps<V extends SelectValue = string> {
  multi?: false;
  clearable: true;
  labelInValue?: false;
  value?: V | null;
  onChange?: (value: V | null) => void;
}

interface SelectSingleLabeledProps<V extends SelectValue = string> {
  multi?: false;
  clearable?: false;
  labelInValue: true;
  value?: LabeledValue<V> | null;
  onChange?: (value: LabeledValue<V>) => void;
}

interface SelectSingleLabeledClearableProps<V extends SelectValue = string> {
  multi?: false;
  clearable: true;
  labelInValue: true;
  value?: LabeledValue<V> | null;
  onChange?: (value: LabeledValue<V> | null) => void;
}

interface SelectMultiProps<V extends SelectValue = string> {
  multi: true;
  clearable?: boolean;
  labelInValue?: false;
  value?: V[];
  onChange?: (value: V[]) => void;
  tagsDisplay?: boolean;
  maxTagCount?: number;
}

interface SelectMultiLabeledProps<V extends SelectValue = string> {
  multi: true;
  clearable?: boolean;
  labelInValue: true;
  value?: LabeledValue<V>[];
  onChange?: (value: LabeledValue<V>[]) => void;
  tagsDisplay?: boolean;
  maxTagCount?: number;
}

interface SelectDynamicMultiProps<V extends SelectValue = string> {
  multi: boolean;
  clearable?: boolean;
  labelInValue?: false;
  value?: V | V[] | null;
  onChange?: (value: V | V[] | null) => void;
  tagsDisplay?: boolean;
  maxTagCount?: number;
}

export type SelectProps<V extends SelectValue = string> = SelectBaseProps<V> &
  (
    | SelectSingleProps<V>
    | SelectSingleClearableProps<V>
    | SelectSingleLabeledProps<V>
    | SelectSingleLabeledClearableProps<V>
    | SelectMultiProps<V>
    | SelectMultiLabeledProps<V>
    | SelectDynamicMultiProps<V>
  );

export type GroupedSelectProps<V extends SelectValue = string> = Omit<
  SelectProps<V>,
  "options" | "groups"
> & {
  groups: SelectOptionGroup<V>[];
};

// ─── Autocomplete ───────────────────────────────────────────────────────────

type AutocompleteOmittedProps =
  | "search"
  | "searchValue"
  | "onDeselect"
  | "closeOnTriggerClick"
  | "groups"
  | "renderValue"
  | "tagRender"
  | "creatable"
  | "onCreate"
  | "createLabel";

export interface AutocompleteProps<V extends string = string> extends Omit<
  SelectBaseProps<V>,
  AutocompleteOmittedProps
> {
  /** Конфигурация маски imask (если не указана — свободный текст) */
  mask?: FactoryOpts;
  /** Текст инпута. Выбор опции подставляет `option.value`,
   *  `label` — только отображение в списке. */
  value?: string;
  /** Вызывается при вводе текста и при выборе опции */
  onChange?: (value: string) => void;
  /** Кнопка очистки в инпуте (по умолчанию включена) */
  clearable?: boolean;
}
