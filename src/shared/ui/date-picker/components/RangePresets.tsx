import type { DateRange, DateRangePreset } from "../types";

export interface RangePresetsProps {
  presets: DateRangePreset[];
  onSelect: (range: DateRange) => void;
}

const PRESET_CLASS =
  "w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors cursor-pointer hover:bg-accent hover:text-accent-foreground";

/** Быстрые диапазоны («Сегодня», «7 дней», ...) рядом с календарём. */
export const RangePresets = ({ presets, onSelect }: RangePresetsProps) => (
  <div
    className="flex flex-col gap-0.5 border-r p-2 min-w-32"
    role="group"
    aria-label="Быстрый выбор"
  >
    {presets.map(preset => (
      <button
        key={preset.label}
        type="button"
        className={PRESET_CLASS}
        onClick={() => onSelect(preset.range)}
      >
        {preset.label}
      </button>
    ))}
  </div>
);
