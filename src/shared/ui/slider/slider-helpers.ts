import type { ReactNode } from "react";

import type { SliderOrientation } from "./slider-variants";

export type SliderValue = number | number[];

export interface SliderMark {
  value: number;
  label?: ReactNode;
}

export const toValueArray = (
  value: SliderValue | undefined,
  fallback: number,
): number[] => {
  if (value === undefined) return [fallback];

  return Array.isArray(value) ? value : [value];
};

/** Подпись ползунка по умолчанию: одно значение или границы диапазона. */
export const defaultThumbLabel = (index: number, count: number): string => {
  if (count === 1) return "Значение";
  if (count === 2) return index === 0 ? "Минимум" : "Максимум";

  return `Значение ${index + 1}`;
};

/**
 * Положение центра ползунка вдоль трека — та же формула, что у Radix:
 * крайние ползунки не выходят за трек, поэтому смещаются на полдиаметра.
 */
export const getMarkPosition = (
  value: number,
  min: number,
  max: number,
  thumbSize: number,
  inverted: boolean,
): string => {
  const span = max - min || 1;
  const raw = ((value - min) / span) * 100;
  const percent = inverted ? 100 - raw : raw;
  const half = thumbSize / 2;
  const offset = half - (percent / 50) * half;

  return `calc(${percent}% + ${offset}px)`;
};

/** Край трека, от которого отсчитывается положение: как у Radix. */
export const getStartEdge = (
  orientation: SliderOrientation,
): "left" | "bottom" => (orientation === "vertical" ? "bottom" : "left");
