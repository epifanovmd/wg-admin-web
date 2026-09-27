import { format, startOfDay } from "date-fns";

/** Формат времени во всех пикерах: 24 часа. */
export const TIME_FORMAT = "HH:mm";

/** Шаг списка времени по умолчанию, минут. */
export const DEFAULT_TIME_STEP = 30;

const MINUTES_PER_DAY = 24 * 60;

export interface TimeParts {
  hours: number;
  minutes: number;
}

const pad = (value: number): string => String(value).padStart(2, "0");

const toTimeText = (totalMinutes: number): string =>
  `${pad(Math.floor(totalMinutes / 60))}:${pad(totalMinutes % 60)}`;

/** «HH:mm» → часы и минуты; `undefined` для неполного или неверного текста. */
export const parseTime = (text: string): TimeParts | undefined => {
  const match = /^(\d{2}):(\d{2})$/.exec(text);

  if (!match) return undefined;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours > 23 || minutes > 59) return undefined;

  return { hours, minutes };
};

export const formatTime = (date: Date | undefined): string =>
  date ? format(date, TIME_FORMAT) : "";

/** Копия даты с заданным временем (секунды и миллисекунды обнуляются). */
export const applyTime = (date: Date, { hours, minutes }: TimeParts): Date => {
  const next = new Date(date);

  next.setHours(hours, minutes, 0, 0);

  return next;
};

/** День из `day`, время из `timeSource` (или 00:00, если его нет). */
export const mergeDateAndTime = (
  day: Date,
  timeSource: Date | undefined,
): Date =>
  timeSource
    ? applyTime(day, {
        hours: timeSource.getHours(),
        minutes: timeSource.getMinutes(),
      })
    : startOfDay(day);

/** Сдвиг времени на `deltaMinutes` по кругу в пределах суток. */
export const shiftTime = (time: TimeParts, deltaMinutes: number): TimeParts => {
  const total =
    (((time.hours * 60 + time.minutes + deltaMinutes) % MINUTES_PER_DAY) +
      MINUTES_PER_DAY) %
    MINUTES_PER_DAY;

  return { hours: Math.floor(total / 60), minutes: total % 60 };
};

/** Варианты времени за сутки с шагом `step` минут: «00:00», «00:30», … */
export const buildTimeOptions = (step: number): string[] => {
  const safeStep = Math.max(1, Math.floor(step));

  return Array.from(
    { length: Math.ceil(MINUTES_PER_DAY / safeStep) },
    (_, index) => toTimeText(index * safeStep),
  );
};
