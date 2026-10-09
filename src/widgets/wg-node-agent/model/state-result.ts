import type { EWgInterfaceStatus } from "@shared/api/gen/main/model";

/** Состояние интерфейса в итоге применения `wg/state`. */
export interface IStateInterface {
  name: string;
  status: EWgInterfaceStatus;
  message: string | null;
}

/** Итог применения `wg/state` воркером wg: интерфейсы и ошибки. */
export interface IWgStateResult {
  version: number | null;
  appliedAt: number | null;
  interfaces: IStateInterface[];
  errors: string[];
}

const STATUSES: readonly string[] = ["up", "down", "error", "unknown"];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

const toInterface = (raw: unknown): IStateInterface[] => {
  if (!isRecord(raw) || typeof raw.name !== "string") return [];

  return [
    {
      name: raw.name,
      status: (STATUSES.includes(raw.status as string)
        ? raw.status
        : "unknown") as EWgInterfaceStatus,
      message: typeof raw.message === "string" ? raw.message : null,
    },
  ];
};

/**
 * Итог `wg/state` из `result` статуса настройки; не похоже на итог воркера wg
 * — `null` (показывается как JSON).
 */
export const parseWgStateResult = (result: unknown): IWgStateResult | null => {
  if (!isRecord(result) || !Array.isArray(result.interfaces)) return null;

  return {
    version: typeof result.version === "number" ? result.version : null,
    appliedAt: typeof result.appliedAt === "number" ? result.appliedAt : null,
    interfaces: result.interfaces.flatMap(toInterface),
    errors: Array.isArray(result.errors)
      ? result.errors.filter(error => typeof error === "string")
      : [],
  };
};
