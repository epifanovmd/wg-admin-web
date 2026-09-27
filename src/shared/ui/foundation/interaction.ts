/**
 * Эффекты наведения — имена утилит из `app/styles/motion.css`. Сами эффекты
 * (длительность, кривая, сила) настраиваются там, здесь — только выбор.
 */
export const INTERACTION = {
  none: "",
  surface: "hover-surface",
  lift: "hover-lift",
} as const;

export type Interaction = keyof typeof INTERACTION;
